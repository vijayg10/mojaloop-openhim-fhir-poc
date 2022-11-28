// Copyright 2022 Digital Convergence Initiative
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { StateResponseToolkit } from '../plugins/state'
import { Request, ResponseObject } from '@hapi/hapi'
import { ValidationError } from '../../validation/validation-error'
import PaymentMultiplexer, { Mojaloop3PPPayabilityCheckRequest } from '../../../pil-payment-multiplexer'
import DirectoryMultiplexer from '../../../pil-directory-multiplexer'

interface PayeeItem {
  payeeIdType: string;
  payeeIdValue: string;
  amount: string;
  currency: string;
}
interface DisbursementCheckRequest {
  note: string;
  payeeList: PayeeItem[];
}

interface PayeeResultItem extends PayeeItem {
  isPayable: Boolean;
  timestamp: string;
  name?: string | undefined;
  dateOfBirth?: string | undefined;
  errors?: string[];
}

interface DisbursementCheckResult {
  payeeResults: PayeeResultItem[];
}

const disbursementCheck = async (
  _context: unknown,
  _request: Request,
  h: StateResponseToolkit
): Promise<ResponseObject> => {
  try {
    const payeeResults: PayeeResultItem[] = []
    const disbursementRequest = _request.payload as DisbursementCheckRequest
    // TODO: In real implementation, the disbursement request from the client should be stored in redis here.
    // And the Directory Multiplexer service should be notified using some kafka message event to fetch the account information for each individual item
    // For PoC, we are looping through the payeeList and calling the DirectoryMultiplexer function directly here
    for await (const payeeItem of disbursementRequest.payeeList) {
      try {
        const mapInfo = await DirectoryMultiplexer.getPayeeAccountInformation({
          payeeIdType: payeeItem.payeeIdType,
          payeeIdValue: payeeItem.payeeIdValue
        })
        const paymentExecutionSystemInfo = mapInfo.paymentExecutionSystemInfo
        // TODO: In real implementation, the payment multiplexer service / payability multiplexer service should take care of the payability check based on the 
        // payment execution system information provided by directory multiplexer service.
        // For PoC, we are checking the payment execution system and calling the PaymentMultiplexer function directly here
        switch(mapInfo.paymentExecutionSystem) {
          case 'MOJALOOP-3PP': {
            const payabilityCheckRequest : Mojaloop3PPPayabilityCheckRequest = {
              pispId: paymentExecutionSystemInfo.payerDfspId,
              payerIdType: paymentExecutionSystemInfo.payerIdType,
              payerIdValue: paymentExecutionSystemInfo.payerIdValue,
              payeeIdType: paymentExecutionSystemInfo.payeeIdType,
              payeeIdValue: paymentExecutionSystemInfo.payeeIdValue
            }
            const mojaloopResponse = await PaymentMultiplexer.checkPayability(payabilityCheckRequest)
            const disbursementCheckResponseItem = {
              payeeInformation: mojaloopResponse.partyResponse,
              error: mojaloopResponse.error
            }
            payeeResults.push({
              ...payeeItem,
              isPayable: mojaloopResponse.isPayable,
              timestamp: new Date().toISOString(),
              name: mojaloopResponse.partyResponse?.name,
              dateOfBirth: mojaloopResponse.partyResponse?.personalInfo?.dateOfBirth,
            })
            break;
          }
          default: {
            throw(new Error(`Unsupported payment execution system ${mapInfo.paymentExecutionSystem}`))
          }
        }
      } catch (err: any) {
        if (err instanceof ValidationError) {
          payeeResults.push({
            ...payeeItem,
            isPayable: false,
            timestamp: new Date().toISOString(),
            errors: err.validationErrors
          })
        } else {
          payeeResults.push({
            ...payeeItem,
            isPayable: false,
            timestamp: new Date().toISOString(),
            errors: [ err.message ]
          })
        }
      }
    }
    return h.response({ payeeResults }).code(200)
  } catch (e) {
    h.getLogger().error(e)
    return h.response().code(500)
  }
}

export default {
  disbursementCheck
}

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
import PaymentMultiplexer, { Mojaloop3PPSendMoneyRequest } from '../../../pil-payment-multiplexer'
import DirectoryMultiplexer from '../../../pil-directory-multiplexer'
import { ObjectStore } from '../../lib/obj-store'

interface PayeeItem {
  payeeIdType: string;
  payeeIdValue: string;
  amount: string;
  currency: string;
}
interface DisbursementRequest {
  disbursementId: string;
  note: string;
  payeeList: PayeeItem[];
}

interface PayeeResultItem extends PayeeItem {
  timestamp: string;
  status: string;
  amountDebited?: string | undefined;
  amountCredited?: string | undefined;
  errors?: string[];
}
interface DisbursementResult {
  disbursementId: string;
  payeeResults: PayeeResultItem[];
}

const postDisbursement = async (
  _context: unknown,
  _request: Request,
  h: StateResponseToolkit
): Promise<ResponseObject> => {
  try {
    const payeeResults: PayeeResultItem[] = []
    const disbursementRequest = _request.payload as DisbursementRequest
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
        // TODO: In real implementation, the payment multiplexer service should take care of the payment execution based on the 
        // payment execution system information provided by directory multiplexer service.
        // For PoC, we are checking the payment execution system and calling the PaymentMultiplexer function directly here
        switch(mapInfo.paymentExecutionSystem) {
          case 'MOJALOOP-3PP': {
            const sendMoneyRequest : Mojaloop3PPSendMoneyRequest = {
              pispId: paymentExecutionSystemInfo.pispId,
              payerIdType: paymentExecutionSystemInfo.payerIdType,
              payerIdValue: paymentExecutionSystemInfo.payerIdValue,
              payeeIdType: paymentExecutionSystemInfo.payeeIdType,
              payeeIdValue: paymentExecutionSystemInfo.payeeIdValue,
              amount: payeeItem.amount,
              currency: payeeItem.currency
            }
            const mojaloopResponse = await PaymentMultiplexer.sendMoney(sendMoneyRequest)
            payeeResults.push({
              ...payeeItem,
              timestamp: new Date().toISOString(),
              status: mojaloopResponse.currentState,
              // TODO: The following fields are optional
              // Usually, these fields are based on payment execution system response
              // For Poc, we are just passing the amount from the request
              amountDebited: payeeItem.amount,
              amountCredited: payeeItem.amount
            })
            break;
          }
          default: {
            throw(new Error(`Unsupported payment execution system ${mapInfo.paymentExecutionSystem}`))
          }
        }
      } catch (err: any) {
        console.log(err.message)
        if (err instanceof ValidationError) {
          payeeResults.push({
            ...payeeItem,
            timestamp: new Date().toISOString(),
            status: 'ABORTED',
            errors: err.validationErrors
          })
        } else {
          payeeResults.push({
            ...payeeItem,
            timestamp: new Date().toISOString(),
            status: 'ABORTED',
            errors: [ err.message ]
          })
        }
      }
    }
    const obj = ObjectStore.getInstance()
    const resp: DisbursementResult = {
      disbursementId: disbursementRequest.disbursementId,
      payeeResults
    }
    obj.data[disbursementRequest.disbursementId] = resp
    return h.response(resp).code(200)
  } catch (e) {
    h.getLogger().error(e)
    return h.response().code(500)
  }
}

export default {
  postDisbursement
}

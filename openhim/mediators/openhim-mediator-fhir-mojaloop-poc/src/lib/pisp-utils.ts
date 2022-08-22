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

import axios from 'axios'
import Config from '../shared/config'
// import Logger from '@mojaloop/central-services-logger'
import assert from 'assert'
import { FHIR4Invoice } from './fhir4-utils'
import FHIR4Utils from './fhir4-utils'

export interface PISPRequest {
  payeeIdType: string;
  payerIdValue: string;
  payeeIdValue: string;
  amount: string;
  currency: string;
}

export interface PISPResponse {
  lookupResponse: any;
  initiateResponse: any;
  approveResponse: any;
}

const sendMoney = async (invoice: FHIR4Invoice): Promise<PISPResponse> => {
  const pispRequest : PISPRequest = await FHIR4Utils.convertFHIRInvoiceToMojaloopRequest(invoice)
  const pispURL = Config.PISP_ENDPOINT + '/sendmoney'
  const response = await axios.post<any>(pispURL, pispRequest)
  assert.equal(response.status, 200)
  const pispResponse: PISPResponse = response.data
  assert.equal(pispResponse.approveResponse?.currentState, 'transactionStatusReceived')
  assert.equal(pispResponse.approveResponse?.transactionStatus?.transactionRequestState, 'ACCEPTED')
  return pispResponse
}

export default {
  sendMoney
}

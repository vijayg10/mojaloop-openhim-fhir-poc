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

export interface PILRequest {
  disbursementId: string;
  note: string;
  payeeList: {
    payeeIdType: string;
    payeeIdValue: string;
    amount: string;
    currency: string;
  }[];
}

export interface PILResponse {
  disbursementId: string;
  payeeResults: any[];
}

const sendMoney = async (invoice: FHIR4Invoice): Promise<PILResponse> => {
  const pilRequest : PILRequest = await FHIR4Utils.convertFHIRInvoiceToPILRequest(invoice)
  const pilURL = Config.PIL_ENDPOINT + '/disbursement'
  const response = await axios.post<any>(pilURL, pilRequest)
  assert.equal(response.status, 200)
  const pilResponse: PILResponse = response.data
  // assert.equal(pilResponse.approveResponse?.currentState, 'transactionStatusReceived')
  // assert.equal(pilResponse.approveResponse?.transactionStatus?.transactionRequestState, 'ACCEPTED')
  return pilResponse
}

export default {
  sendMoney
}

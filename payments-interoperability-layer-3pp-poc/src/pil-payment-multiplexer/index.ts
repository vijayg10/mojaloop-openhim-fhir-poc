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
import Config from './lib/config'
import assert from 'assert'

const sendMoney = async (sendMoneyRequest: Mojaloop3PPSendMoneyRequest) => {
  // TODO: We need to implement adapters to connect to various payment execution systems
  // For PoC, we are hardcoded the following http request and response execution here.
  const endpoint = Config.MOJALOOP_3PP_CONNECTION_INFO.find(item => item.pispId === sendMoneyRequest.pispId)?.endpoint
  if (endpoint) {
    const sendMoneyURI = `${endpoint}/sendmoney`
    console.log(`Sending http request POST ${sendMoneyURI}`)
    const resp = await axios.post<any>(sendMoneyURI, sendMoneyRequest)
    assert.equal(resp.status, 200)
    // TODO: The response conversion should be based on the mappings in the adapters
    // For PoC, the following is a sample conversion for the transfer status
    if (resp.data.approveResponse.transactionStatus.transactionState === 'COMPLETED') {
      return {
        currentState: 'COMPLETED'
      }
    } else {
      return {
        currentState: 'ABORTED'
      }
    }
  } else {
    throw(new Error(`Can't find mojaloop connection information for pispId ${sendMoneyRequest.pispId}`))
  }
}

const checkPayability = async (payabilityCheckRequest: Mojaloop3PPPayabilityCheckRequest) => {
  const endpoint = Config.MOJALOOP_3PP_CONNECTION_INFO.find(item => item.pispId === payabilityCheckRequest.pispId)?.endpoint
  if (endpoint) {
    const payabilityCheckURI = `${endpoint}/payabilityCheck`
    console.log(`Sending http request POST ${payabilityCheckURI}`)
    const resp = await axios.post<any>(payabilityCheckURI, payabilityCheckRequest)
    assert.equal(resp.status, 200)
    return resp.data
  } else {
    throw(new Error(`Can't find mojaloop connection information for pispId ${payabilityCheckRequest.pispId}`))
  }
}


export interface Mojaloop3PPSendMoneyRequest {
  pispId: string;
  payerIdType: string;
  payerIdValue: string;
  payeeIdType: string;
  payeeIdValue: string;
  amount: string;
  currency: string;
}

export interface Mojaloop3PPPayabilityCheckRequest {
  pispId: string;
  payerIdType: string;
  payerIdValue: string;
  payeeIdType: string;
  payeeIdValue: string;
}

export default {
  sendMoney,
  checkPayability
}

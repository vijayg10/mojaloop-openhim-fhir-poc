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

import Config from './lib/config'

const getPayeeAccountInformation = async (payeeAccountInformationRequest: GetPayeeAccountInformationRequest) => {
  const mappedInfo = Config.PAYEE_RESOLUTION_MAP.find(item => item.payeeIdType === payeeAccountInformationRequest.payeeIdType && item.payeeIdValue == payeeAccountInformationRequest.payeeIdValue)
  if(mappedInfo) {
    return mappedInfo
  } else {
    throw(new Error(`Unable to fetch payee account information for the values ${payeeAccountInformationRequest.payeeIdType} ${payeeAccountInformationRequest.payeeIdValue}`))
  }
}

export interface GetPayeeAccountInformationRequest {
  payeeIdType: string;
  payeeIdValue: string;
}

export default {
  getPayeeAccountInformation
}

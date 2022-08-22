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

import Config from '../shared/config'

export interface MojaloopId {
  idType: string;
  idValue: string;
}

// This function is defined as async for future needs. We may need to contact external data store to get the mappings.
const getMojaloopId = async (uuid: string): Promise<MojaloopId> => {
  const foundMapItem = Config.RECEPIENT_ID_MAP.find(item => item.uuid === uuid)
  if (foundMapItem) {
    return {
      idType: foundMapItem.idType,
      idValue: foundMapItem.idValue
    }
  } else {
    throw (new Error('There is no corresponding mojaloop identifier found for UUID: ' + uuid))
  }
}

export default {
  getMojaloopId
}

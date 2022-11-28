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

import { ResponseToolkit, Server } from '@hapi/hapi'
import { logger } from '../../shared/logger'

export interface StateResponseToolkit extends ResponseToolkit {
  getLogger: () => any
}

export const StatePlugin = {
  version: '1.0.0',
  name: 'StatePlugin',
  once: true,

  register: async (server: Server): Promise<void> => {
    logger.info('StatePlugin: plugin initializing')

    try {
      // prepare toolkit accessors
      server.decorate('toolkit', 'getLogger', (): any => logger)
    } catch (err) {
      logger.error('StatePlugin: unexpected exception during plugin registration')
      logger.error(err)
      logger.error('StatePlugin: exiting process')
      process.exit(1)
    }
  }
}

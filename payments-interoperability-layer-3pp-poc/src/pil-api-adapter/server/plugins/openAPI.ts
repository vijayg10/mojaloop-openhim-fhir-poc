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

import Path from 'path'
import { Server, ServerRegisterPluginObject } from '@hapi/hapi'
import { Util } from '@mojaloop/central-services-shared'
import Handlers from '../handlers'

const OpenapiBackend = Util.OpenapiBackend

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function initialize (): Promise<ServerRegisterPluginObject<any>> {
  return {
    plugin: {
      name: 'openapi',
      version: '1.0.0',
      multiple: true,
      register: function (server: Server, options: {[index: string]: string | object}): void {
        server.expose('openapi', options.openapi)
      }
    },
    options: {
      openapi: await OpenapiBackend.initialise(
        Path.resolve(__dirname, '../../interface/api.yaml'),
        Handlers
      )
    }
  }
}

export default {
  initialize
}

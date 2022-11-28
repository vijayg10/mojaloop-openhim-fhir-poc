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

// workaround for lack of typescript types for mojaloop dependencies
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../ambient.d.ts"/>
import { Server } from '@hapi/hapi'
import { ServiceConfig } from '../shared/config'
import extensions from './extensions'
import plugins from './plugins'
import * as Path from 'path'

import onValidateFail from './handlers/onValidateFail'
import Logger from '@mojaloop/central-services-logger'
import { validateRoutes } from '@mojaloop/central-services-error-handling'

async function _create (config: ServiceConfig): Promise<Server> {
  const server: Server = await new Server({
    host: config.HOST,
    port: config.PORT,
    routes: {
      validate: {
        options: validateRoutes(),
        failAction: onValidateFail
      },
      cors: {
        origin: config.CORS_WHITELIST,
        credentials: config.ALLOW_CREDENTIALS
      },
      files: {
        relativeTo: Path.join(__dirname, '..')
      }
    }
  })
  return server
}

async function _start (server: Server): Promise<Server> {
  Logger.info(`openhim-mediator-fhir-pil-poc is running @ ${server.info.uri}`)
  await server.start()
  
  return server
}

async function run (config: ServiceConfig): Promise<Server> {
  const server = await _create(config)
  await plugins.register(server)
  await extensions.register(server)
  return _start(server)
}

export default {
  run
}

// workaround for lack of typescript types for mojaloop dependencies
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../ambient.d.ts"/>
import { Server } from '@hapi/hapi'
import { ServiceConfig } from '../shared/config'
import extensions from './extensions'
import plugins from './plugins'

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
      }
    }
  })
  return server
}

async function _start (server: Server): Promise<Server> {
  Logger.info(`openhim-mediator-fhir-mojaloop-poc is running @ ${server.info.uri}`)
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

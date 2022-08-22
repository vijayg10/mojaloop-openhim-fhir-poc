import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import { Server, ServerRoute } from '@hapi/hapi'

import ErrorHandling from '@mojaloop/central-services-error-handling'
import { Util } from '@mojaloop/central-services-shared'
import OpenAPI from './openAPI'
import ApiDoc from './apiDoc'
import { StatePlugin } from './state'

async function register (server: Server): Promise<Server> {
  const openapiBackend = await OpenAPI.initialize()
  const plugins = [
    StatePlugin,
    ApiDoc,
    Util.Hapi.OpenapiBackendValidator,
    openapiBackend,
    Inert,
    Vision,
    ErrorHandling,
    Util.Hapi.HapiEventPlugin
  ]

  await server.register(plugins)

  // use as a catch-all handler
  server.route({
    method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    path: '/{path*}',
    handler: (req, h): ServerRoute =>
      openapiBackend.options.openapi.handleRequest(
        {
          method: req.method,
          path: req.path,
          body: req.payload,
          query: req.query,
          headers: req.headers
        },
        req,
        h
      )
  })

  return server
}

export default {
  register
}

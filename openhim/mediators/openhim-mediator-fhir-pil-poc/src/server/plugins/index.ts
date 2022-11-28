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

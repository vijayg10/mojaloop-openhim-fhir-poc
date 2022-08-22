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

import Shared from '@mojaloop/central-services-shared'
import Config from '../../shared/config'
import { StateResponseToolkit } from '../plugins/state'
import { Request, ResponseObject } from '@hapi/hapi'

const healthCheck = new Shared.HealthCheck.HealthCheck(Config.PACKAGE, [])
/**
 * Operations on /health
 */

/**
 * summary: Get Server
 * description: The HTTP request GET /health is used to return the current status of the API.
 * parameters:
 * produces: application/json
 * responses: 200, 400, 401, 403, 404, 405, 406, 501, 503
 */
const get = async (_context: unknown, _request: Request, h: StateResponseToolkit): Promise<ResponseObject> => {
  const response = await healthCheck.getHealth()

  response.LoggerPresent = typeof h.getLogger() !== 'undefined'
  return h.response(response).code(200)
}

export default {
  get
}

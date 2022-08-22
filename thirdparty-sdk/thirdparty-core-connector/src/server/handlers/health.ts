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

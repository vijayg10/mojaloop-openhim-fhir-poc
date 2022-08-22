import { StateResponseToolkit } from '~/server/plugins/state'
import { Request, ResponseObject } from '@hapi/hapi'
import { ValidationError } from '../../validation/validation-error'
import PISPUtils from '../../lib/pisp-utils'
import { SendMoneyRequest } from '../../lib/pisp-utils'

interface InvoiceErrorResponse {
  isProcessed: boolean;
  errors: string[];
}


const sendMoney = async (
  _context: unknown,
  _request: Request,
  h: StateResponseToolkit
): Promise<ResponseObject> => {
  try {
    const response = {}
    const sendMoneyRequest : SendMoneyRequest = <SendMoneyRequest>_request.payload
    try {
      // Some aync communication here
      const mojaloopResponse = await PISPUtils.sendMoney(sendMoneyRequest)
      return h.response(mojaloopResponse).code(200)
    } catch (err) {
      if (err instanceof ValidationError) {
        const errorResponse: InvoiceErrorResponse = {
          isProcessed: false,
          errors: err.validationErrors
        }
        return h.response(errorResponse).code(406)
      } else {
        throw err
      }
    }
    return h.response(response).code(200)
  } catch (e) {
    h.getLogger().error(e)
    return h.response().code(500)
  }
}

export default {
  sendMoney
}

import { StateResponseToolkit } from '~/server/plugins/state'
import { Request, ResponseObject } from '@hapi/hapi'
import { ValidationError } from '../../validation/validation-error'
import Config from '../../shared/config'
import PISPUtils from '../../lib/pisp-utils'
import { FHIR4Invoice } from '../../lib/fhir4-utils'
import OpenHIMUtils from '../../lib/openhim-utils'
import FHIR4Utils from '../../lib/fhir4-utils'

interface InvoiceErrorResponse {
  isProcessed: boolean;
  errors: string[];
}

const SendMoney = async (
  _context: unknown,
  _request: Request,
  h: StateResponseToolkit
): Promise<ResponseObject> => {
  try {
    const response = {}
    const invoice : FHIR4Invoice = <FHIR4Invoice>_request.payload
    try {
      // Some aync communication here
      const mojaloopResponse = await PISPUtils.sendMoney(invoice)
      const fhir4PaymentNotice = FHIR4Utils.convertMojaloopResponseToFHIRPaymentNotice(invoice, mojaloopResponse)
      const openHimResponse = OpenHIMUtils.buildReturnObject('Completed', '200', fhir4PaymentNotice)
      return h.response(openHimResponse).code(200)
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
  SendMoney
}

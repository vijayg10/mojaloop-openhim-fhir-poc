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

import { StateResponseToolkit } from '~/server/plugins/state'
import { Request, ResponseObject } from '@hapi/hapi'
import { ValidationError } from '../../validation/validation-error'
import Config from '../../shared/config'
import PISPUtils from '../../lib/pil-utils'
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
      const pilResponse = await PISPUtils.sendMoney(invoice)
      const fhir4PaymentNotice = FHIR4Utils.convertPILResponseToFHIRPaymentNotice(invoice, pilResponse)
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

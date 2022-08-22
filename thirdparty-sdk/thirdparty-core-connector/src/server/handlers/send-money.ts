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

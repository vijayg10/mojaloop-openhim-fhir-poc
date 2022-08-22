import axios from 'axios'
import Config from '../shared/config'
// import Logger from '@mojaloop/central-services-logger'
import assert from 'assert'
import { FHIR4Invoice } from './fhir4-utils'
import FHIR4Utils from './fhir4-utils'

export interface PISPRequest {
  payeeIdType: string;
  payerIdValue: string;
  payeeIdValue: string;
  amount: string;
  currency: string;
}

export interface PISPResponse {
  lookupResponse: any;
  initiateResponse: any;
  approveResponse: any;
}

const sendMoney = async (invoice: FHIR4Invoice): Promise<PISPResponse> => {
  const pispRequest : PISPRequest = await FHIR4Utils.convertFHIRInvoiceToMojaloopRequest(invoice)
  const pispURL = Config.PISP_ENDPOINT + '/sendmoney'
  const response = await axios.post<any>(pispURL, pispRequest)
  assert.equal(response.status, 200)
  const pispResponse: PISPResponse = response.data
  assert.equal(pispResponse.approveResponse?.currentState, 'transactionStatusReceived')
  assert.equal(pispResponse.approveResponse?.transactionStatus?.transactionRequestState, 'ACCEPTED')
  return pispResponse
}

export default {
  sendMoney
}

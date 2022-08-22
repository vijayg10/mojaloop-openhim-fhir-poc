import { Util } from '@mojaloop/central-services-shared'
import Health from './health'
import FHIR4Invoice from './fhir4-invoice'

const OpenapiBackend = Util.OpenapiBackend

export default {
  HealthGet: Health.get,
  SendMoneyFHIR4Invoice: FHIR4Invoice.SendMoney,
  validationFail: OpenapiBackend.validationFail,
  notFound: OpenapiBackend.notFound,
  methodNotAllowed: OpenapiBackend.methodNotAllowed
}

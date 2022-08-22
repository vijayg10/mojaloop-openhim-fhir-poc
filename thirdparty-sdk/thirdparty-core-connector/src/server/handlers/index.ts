import { Util } from '@mojaloop/central-services-shared'
import Health from './health'
import ThirdPartySendMoney from './send-money'

const OpenapiBackend = Util.OpenapiBackend

export default {
  HealthGet: Health.get,
  SendMoney: ThirdPartySendMoney.sendMoney,
  validationFail: OpenapiBackend.validationFail,
  notFound: OpenapiBackend.notFound,
  methodNotAllowed: OpenapiBackend.methodNotAllowed
}

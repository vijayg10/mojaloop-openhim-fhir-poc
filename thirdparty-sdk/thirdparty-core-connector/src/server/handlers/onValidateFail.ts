import Boom from '@hapi/boom'
import { Request, Lifecycle, ResponseToolkit } from '@hapi/hapi'

export default function onValidateFail (
  _request: Request,
  _h: ResponseToolkit,
  err?: Error | undefined): Lifecycle.ReturnValue {
  throw Boom.boomify(err as Error)
}

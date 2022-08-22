import { ResponseToolkit, Request } from '@hapi/hapi'

export default async function onPreHandler (request: Request, h: ResponseToolkit): Promise<symbol> {
  console.log('Request: ', request.method, request.path, request.payload)
  return h.continue
}

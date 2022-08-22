import Path from 'path'
import { Server, ServerRegisterPluginObject } from '@hapi/hapi'
import { Util } from '@mojaloop/central-services-shared'
import Handlers from '../handlers'

const OpenapiBackend = Util.OpenapiBackend

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function initialize (): Promise<ServerRegisterPluginObject<any>> {
  return {
    plugin: {
      name: 'openapi',
      version: '1.0.0',
      multiple: true,
      register: function (server: Server, options: {[index: string]: string | object}): void {
        server.expose('openapi', options.openapi)
      }
    },
    options: {
      openapi: await OpenapiBackend.initialise(
        Path.resolve(__dirname, '../../interface/api.yaml'),
        Handlers
      )
    }
  }
}

export default {
  initialize
}

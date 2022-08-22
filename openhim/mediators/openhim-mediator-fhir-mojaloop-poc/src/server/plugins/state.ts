import { ResponseToolkit, Server } from '@hapi/hapi'
import { logger } from '../../shared/logger'

export interface StateResponseToolkit extends ResponseToolkit {
  getLogger: () => any
}

export const StatePlugin = {
  version: '1.0.0',
  name: 'StatePlugin',
  once: true,

  register: async (server: Server): Promise<void> => {
    logger.info('StatePlugin: plugin initializing')

    try {
      // prepare toolkit accessors
      server.decorate('toolkit', 'getLogger', (): any => logger)
    } catch (err) {
      logger.error('StatePlugin: unexpected exception during plugin registration')
      logger.error(err)
      logger.error('StatePlugin: exiting process')
      process.exit(1)
    }
  }
}

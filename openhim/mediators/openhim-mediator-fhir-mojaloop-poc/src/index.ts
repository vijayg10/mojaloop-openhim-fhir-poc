import ServiceServer from './server'
import Config from './shared/config'
import OpenHimUtils from './lib/openhim-utils'

// Setup & start API server
ServiceServer.run(Config)
OpenHimUtils.mediatorSetup()

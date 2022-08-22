import Path from 'path'
import { Util } from '@mojaloop/central-services-shared'

const plugin = {
  plugin: Util.Hapi.APIDocumentation,
  options: {
    documentPath: Path.resolve(__dirname, '../../interface/api.yaml'),
    widdershinsOptions: {
      sample: true
    }
  }
}

export default plugin

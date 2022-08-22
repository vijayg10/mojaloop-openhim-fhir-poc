import rc from 'rc'
import parse from 'parse-strings-in-object'
import Config from '../../config/default.json'
import Package from '../../package.json'
export interface ServiceConfig {
  // package.json
  PACKAGE: Record<string, unknown>;
  // API Server
  PORT: number;
  HOST: string;
  CORS_WHITELIST: string[];
  ALLOW_CREDENTIALS: boolean;

  OPENHIM_CONFIG: any,
  OPENHIM_REGISTER: boolean,
  MEDIATOR_CONFIG: any,
  PISP_ENDPOINT: string;
  RECEPIENT_ID_MAP: any[];
}

const RC = parse(rc('OPENHIM_MEDIATOR_FHIR_MOJALOOP', Config)) as ServiceConfig

export default {
  ...RC,
  PACKAGE: Package
}

import rc from 'rc'
import parse from 'parse-strings-in-object'
import Config from '../../config/default.json'
import Package from '../../package.json'
export interface ServiceConfig {
  // package.json
  PACKAGE: Record<string, unknown>;
  // API Server
  LISTEN_PORT: number;
  HOST: string;
  CORS_WHITELIST: string[];
  ALLOW_CREDENTIALS: boolean;

  OUTBOUND_ENDPOINT: string;
  BACKEND_ENDPOINT: string;
  REQUEST_TIMEOUT: number;
  tempRedisConfig: any;
}

const RC = parse(rc('THIRDPARTY_CORE_CONNECTOR', Config)) as ServiceConfig

export default {
  ...RC,
  PACKAGE: Package
}

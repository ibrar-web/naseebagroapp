import {
  NODE_ENV,
  LOCAL_API,
  LOCAL_SOCKET,
  DEV_API,
  DEV_SOCKET,
  PROD_API,
  PROD_SOCKET,
  APP_VERSION,
  APP_TIMEOUT,
} from '@env';

type EnvType = 'local' | 'development' | 'production';

interface EnvironmentConfig {
  API_BASE_URL: string;
  SOCKET_URL: string;
  TIMEOUT: number;
  VERSION: string;
  APP_ENV: EnvType;
}

const ENVIRONMENT_CONFIG: Record<EnvType, EnvironmentConfig> = {
  local: {
    API_BASE_URL: LOCAL_API,
    SOCKET_URL: LOCAL_SOCKET,
    TIMEOUT: Number(APP_TIMEOUT) || 30000,
    VERSION: APP_VERSION || '1.0.0',
    APP_ENV: 'local',
  },
  development: {
    API_BASE_URL: DEV_API,
    SOCKET_URL: DEV_SOCKET,
    TIMEOUT: Number(APP_TIMEOUT) || 30000,
    VERSION: APP_VERSION || '1.0.0',
    APP_ENV: 'development',
  },
  production: {
    API_BASE_URL: PROD_API,
    SOCKET_URL: PROD_SOCKET,
    TIMEOUT: Number(APP_TIMEOUT) || 30000,
    VERSION: APP_VERSION || '1.0.0',
    APP_ENV: 'production',
  },
};

const currentEnv = (NODE_ENV || 'development') as EnvType;
export const ENV = ENVIRONMENT_CONFIG[currentEnv];
console.log('ENV',currentEnv, ENV);
export default ENV;

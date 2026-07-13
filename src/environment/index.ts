type EnvType = 'local' | 'development' | 'production';

interface EnvironmentConfig {
  API_BASE_URL: string;
  SOCKET_URL: string;
  TIMEOUT: number;
  VERSION: string;
  APP_ENV: EnvType;
  NODE_ENV: string;
}

const ENVIRONMENT_CONFIG: Record<EnvType, EnvironmentConfig> = {
  local: {
    API_BASE_URL: 'http://192.168.100.26:3004/api/v1',
    SOCKET_URL: 'http://192.168.100.26:3004',
    TIMEOUT: 30000,
    VERSION: '1.0.0',
    APP_ENV: 'local',
    NODE_ENV: 'local',
  },
  development: {
    API_BASE_URL: 'https://naseebagri.com/api/v1',
    SOCKET_URL: 'https://naseebagri.com',
    TIMEOUT: 30000,
    VERSION: '1.0.0',
    APP_ENV: 'development',
    NODE_ENV: 'development',
  },
  production: {
    API_BASE_URL: 'https://api.naseebagro.com/api/v1',
    SOCKET_URL: 'wss://api.naseebagro.com',
    TIMEOUT: 30000,
    VERSION: '1.0.0',
    APP_ENV: 'production',
    NODE_ENV: 'production',
  },
};

// Change this line to switch environments: 'local' | 'development' | 'production'
const currentEnv: EnvType = 'development';

export const ENV = ENVIRONMENT_CONFIG[currentEnv];
console.log('ENV', currentEnv, ENV);
export default ENV;

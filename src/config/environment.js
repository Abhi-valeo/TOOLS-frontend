// Environment Configuration
const config = {
  // Environment
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  
  // API URLs
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  HAKEEM_API_URL: import.meta.env.VITE_HAKEEM_API_URL || 'http://ec2-34-227-108-46.compute-1.amazonaws.com:9090',
  CATALOG_API_URL: import.meta.env.VITE_CATALOG_API_URL || (import.meta.env.VITE_APP_ENV === 'production' 
    ? 'https://catalogserviceapi-staging.bevaleo.dev' 
    : 'http://localhost:3100'),
  
  // Feature Flags
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // Development Settings
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
  HOT_RELOAD: import.meta.env.VITE_HOT_RELOAD === 'true',
  
  // Helper functions
  isDevelopment: () => config.APP_ENV === 'development',
  isProduction: () => config.APP_ENV === 'production',
  isDebugEnabled: () => config.ENABLE_DEBUG,
  
  // Logging
  log: (message, ...args) => {
    if (config.ENABLE_DEBUG) {
      console.log(`[${config.APP_ENV.toUpperCase()}]`, message, ...args);
    }
  },
  
  error: (message, ...args) => {
    if (config.ENABLE_DEBUG) {
      console.error(`[${config.APP_ENV.toUpperCase()}] ERROR:`, message, ...args);
    }
  },
  
  warn: (message, ...args) => {
    if (config.ENABLE_DEBUG) {
      console.warn(`[${config.APP_ENV.toUpperCase()}] WARNING:`, message, ...args);
    }
  }
};

export default config; 
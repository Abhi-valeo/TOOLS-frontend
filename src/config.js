const config = {
  development: {
    apiBaseUrl: import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:3100'
  },
  staging: {
    apiBaseUrl: import.meta.env.VITE_CATALOG_API_URL || 'https://catalogserviceapi-staging.bevaleo.dev'
  },
  production: {
    apiBaseUrl: import.meta.env.VITE_CATALOG_API_URL || 'https://catalogserviceapi-staging.bevaleo.dev'
  }
};

// Get the current environment from VITE_APP_ENV or default to production for builds
const env = import.meta.env.VITE_APP_ENV || (import.meta.env.NODE_ENV === 'production' ? 'production' : 'development');

// Export the configuration for the current environment
export const currentConfig = config[env] || config.production;

// Export all configurations for reference
export default config; 
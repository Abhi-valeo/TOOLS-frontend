const config = {
  development: {
    apiBaseUrl: 'http://localhost:3100'
  },
  staging: {
    apiBaseUrl: 'https://catalogserviceapi-staging.bevaleo.dev'
  }
};

// Get the current environment from VITE_ENV or default to development
const env = import.meta.env.VITE_ENV || 'development';

// Export the configuration for the current environment
export const currentConfig = config[env];

// Export all configurations for reference
export default config; 
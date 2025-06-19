# Environment Setup Guide

This project supports two environments: **Development** and **Production**.

## Environment Files

### Development Environment (`.env.development`)
- Used for local development
- Includes debug features and logging
- Points to development APIs

### Production Environment (`.env.production`)
- Used for production builds
- Optimized for performance
- Points to production APIs

## Available Scripts

### Development Commands
```bash
# Start development server (default)
npm run dev
npm start

# Start development server with production config (for testing)
npm run dev:prod
npm start:prod
```

### Build Commands
```bash
# Build for production (default)
npm run build

# Build for development
npm run build:dev
```

### Preview Commands
```bash
# Preview development build
npm run preview

# Preview production build
npm run preview:prod
```

## Environment Variables

### Development Environment Variables
- `NODE_ENV=development`
- `VITE_APP_ENV=development`
- `VITE_API_BASE_URL=http://localhost:3000`
- `VITE_HAKEEM_API_URL=http://ec2-34-227-108-46.compute-1.amazonaws.com:9090`
- `VITE_ENABLE_DEBUG=true`

### Production Environment Variables
- `NODE_ENV=production`
- `VITE_APP_ENV=production`
- `VITE_API_BASE_URL=https://api.valeotools.com`
- `VITE_HAKEEM_API_URL=https://hakeem-api.valeotools.com`
- `VITE_ENABLE_DEBUG=false`

## Using Environment Configuration

Import the environment config in your components:

```javascript
import config from './config/environment';

// Check environment
if (config.isDevelopment()) {
  console.log('Running in development mode');
}

// Use API URLs
const apiUrl = config.API_BASE_URL;
const hakeemUrl = config.HAKEEM_API_URL;

// Use logging
config.log('This will only show in development');
config.error('Error message');
config.warn('Warning message');
```

## Switching Environments

### For Development
```bash
npm run dev
```

### For Production Testing
```bash
npm run dev:prod
```

### For Production Build
```bash
npm run build
```

## Environment-Specific Features

### Development Features
- Debug logging enabled
- Hot reload enabled
- Development API endpoints
- Error boundaries with detailed messages

### Production Features
- Debug logging disabled
- Optimized builds
- Production API endpoints
- Error boundaries with user-friendly messages
- Analytics enabled (if configured)

## Adding New Environment Variables

1. Add the variable to both `.env.development` and `.env.production`
2. Update `src/config/environment.js` to include the new variable
3. Use the variable in your components through the config object

Example:
```bash
# .env.development
VITE_NEW_FEATURE=true

# .env.production
VITE_NEW_FEATURE=false
```

```javascript
// src/config/environment.js
NEW_FEATURE: import.meta.env.VITE_NEW_FEATURE === 'true',

// In your component
import config from './config/environment';
if (config.NEW_FEATURE) {
  // Feature logic
}
``` 
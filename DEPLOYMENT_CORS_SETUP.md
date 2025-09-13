# CORS Configuration for Deployment

## Overview

The application requires proper CORS (Cross-Origin Resource Sharing) configuration to work securely in production deployments. This document explains how to set up the `ALLOWED_ORIGINS` environment variable for Replit deployments.

## Quick Fix for Deployment Errors

If your deployment is failing with errors like:
```
ALLOWED_ORIGINS environment variable is required in production for CORS security
Application is crash looping due to missing environment variable
```

Follow these steps:

### Step 1: Set ALLOWED_ORIGINS in Deployment Configuration

1. Go to your Replit deployment settings
2. Click "Add deployment secret" or "Environment Variables"
3. Add the following environment variable:
   - **Name**: `ALLOWED_ORIGINS`
   - **Value**: Your production domain(s), comma-separated

### Step 2: Configure Domain Values

**For Veridity application:**
```
ALLOWED_ORIGINS=https://veridity.replit.app,https://app.veridity.net
```

**For single domain:**
```
ALLOWED_ORIGINS=https://your-app-name.replit.app
```

**For multiple domains:**
```
ALLOWED_ORIGINS=https://your-app-name.replit.app,https://your-custom-domain.com,https://www.your-custom-domain.com
```

**For development + production:**
```
ALLOWED_ORIGINS=https://your-app-name.replit.app,http://localhost:5000,https://localhost:5000
```

### Step 3: Security Considerations

- **Never use `*` wildcard** in production as it allows any domain to access your API
- **Always use HTTPS** for production domains (except localhost for development)
- **Include all subdomains** you plan to use (www, api, etc.)
- **Remove unused domains** to minimize attack surface

## Automatic Fallbacks

The application now includes several fallback mechanisms:

1. **Development Mode**: Automatically allows `localhost:5000`
2. **Replit Deployment**: Falls back to using `REPLIT_DOMAINS` if available
3. **Secure Default**: Uses restrictive `same-origin` policy if no configuration is found

## Environment Detection

The application detects the environment using:
- `NODE_ENV=production` for production mode
- `REPLIT_DEPLOYMENT=1` for Replit deployments
- `REPLIT_DOMAINS` for automatic domain detection

## Troubleshooting

### Common Issues

1. **App won't load from browser**: Check that your domain is included in `ALLOWED_ORIGINS`
2. **API calls failing**: Verify the frontend and backend domains match
3. **Mixed content errors**: Ensure all domains use HTTPS in production

### Debug Logging

In deployment mode, the application logs CORS requests to help debug issues:
```
🌐 CORS request from origin: https://example.com, allowed origins: https://your-app.replit.app
🚫 CORS: Blocked request from origin: https://unauthorized-domain.com
```

### Testing Your Configuration

1. Deploy your application with the new `ALLOWED_ORIGINS` setting
2. Open your deployed app in a browser
3. Check the browser console for any CORS errors
4. Verify API calls are working correctly

## Example Configurations

### Basic Web App
```
ALLOWED_ORIGINS=https://my-awesome-app.replit.app
```

### Multi-Domain App
```
ALLOWED_ORIGINS=https://my-app.replit.app,https://my-app.com,https://www.my-app.com,https://api.my-app.com
```

### Development + Staging + Production
```
ALLOWED_ORIGINS=https://my-app.replit.app,https://staging.my-app.com,https://my-app.com,http://localhost:5000
```

## Security Best Practices

1. **Audit your domains regularly** - Remove unused domains from the list
2. **Use specific domains** - Avoid wildcards or overly permissive configurations
3. **Monitor CORS logs** - Check for unauthorized access attempts
4. **Keep domains updated** - Update the list when domains change
5. **Test after changes** - Always verify the app works after updating CORS settings

## Support

If you continue to experience deployment issues after setting `ALLOWED_ORIGINS`:

1. Check the deployment logs for specific error messages
2. Verify all domains use the correct protocol (http/https)
3. Ensure there are no typos in domain names
4. Contact support with the specific error message and your CORS configuration
# Al Falah Study Bot - Deployment Setup Guide

## Environment Variables Setup

### For Local Development:
Create a `.env.production` file in the project root with the following variables:

```bash
# Application Configuration
VITE_APP_TITLE=مساعد الفلاح الذكي
NODE_ENV=production

# API Configuration (Gemini 2.0 Flash)
GEMINI_API_KEY=your_gemini_api_key_here

# OAuth Configuration
OAUTH_SERVER_URL=https://api.manus.im

# Database Configuration
DATABASE_URL=your_database_url_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here
```

### For Render Deployment:

1. Go to your Render Dashboard: https://dashboard.render.com
2. Select your service: `alfalah2026`
3. Go to **Environment** section
4. Add the following environment variables:

| KEY | VALUE |
|-----|-------|
| `VITE_APP_TITLE` | `مساعد الفلاح الذكي` |
| `GEMINI_API_KEY` | Your Gemini API key from https://ai.google.dev/ |
| `OAUTH_SERVER_URL` | `https://api.manus.im` |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your database connection URL |
| `JWT_SECRET` | A secure random string |

5. Click **Save, rebuild, and deploy**

## Getting API Keys:

### Gemini API Key:
1. Visit: https://ai.google.dev/
2. Click "Get API Key"
3. Create a new API key in Google Cloud Console
4. Copy and paste it into the `GEMINI_API_KEY` field

## Important Notes:

- **Never commit `.env.production` to Git** - It's in `.gitignore` for security
- **Keep API keys private** - Don't share them publicly
- **Use environment variables** for all sensitive data
- **Render will automatically use the environment variables** you set in the dashboard

## Troubleshooting:

If you see: `Error calling Gemini API: Error: OPENAI_API_KEY is not configured`
- Make sure `GEMINI_API_KEY` is set in Render Environment
- Wait for the service to rebuild after adding the variable
- Check the logs for any errors

## Support:

For more information about Gemini API, visit: https://ai.google.dev/docs

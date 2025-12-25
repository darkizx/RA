# Al Falah Academy - Setup Instructions

## 🚀 Deployment on Render

### Required Environment Variables

Add these environment variables to your Render service:

#### 1. **BUILT_IN_FORGE_API_KEY** (Required)
- **Value:** `AIzaSyAPAOA_sWTznEtuTNUMBl64R2eU4AJwgUQ`
- **Description:** Gemini API key for AI-powered chat functionality
- **Note:** This is the primary API key for the LLM service

#### 2. **VITE_APP_TITLE** (Optional)
- **Value:** `مساعد الفلاح الذكي`
- **Description:** Application title displayed in browser tab and header

#### 3. **OAUTH_SERVER_URL** (Optional)
- **Value:** `https://api.manus.im`
- **Description:** OAuth server URL (has default value)

#### 4. **BUILT_IN_FORGE_API_URL** (Optional)
- **Value:** `https://forge.manus.im`
- **Description:** Forge API endpoint (has default value)

#### 5. **JWT_SECRET** (Required)
- **Value:** Any random string (e.g., `your-secret-key-here`)
- **Description:** Secret key for session cookies

#### 6. **DATABASE_URL** (Required)
- **Value:** Your database connection string
- **Description:** MySQL/TiDB database URL

---

## 📝 Steps to Deploy

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your service: `alfalah2026`
3. Click on **Environment** in the left sidebar
4. Add/Update the environment variables listed above
5. Click **Save, rebuild, and deploy**
6. Wait 5-10 minutes for the deployment to complete

---

## ✅ Verification

After deployment:
- Check that the page title shows "مساعد الفلاح الذكي"
- Try sending a message in the chat
- Verify no errors appear in the Render logs

---

## 🔧 Troubleshooting

If you see errors:
- **"BUILT_IN_FORGE_API_KEY is not configured"** → Add the API key to Environment
- **"OAUTH_SERVER_URL is not configured"** → Already has default value, should work
- **"Missing session cookie"** → JWT_SECRET may not be set correctly

---

## 📚 Local Development

For local testing, create a `.env.local` file:

```
VITE_APP_TITLE=مساعد الفلاح الذكي
BUILT_IN_FORGE_API_KEY=AIzaSyAPAOA_sWTznEtuTNUMBl64R2eU4AJwgUQ
BUILT_IN_FORGE_API_URL=https://forge.manus.im
OAUTH_SERVER_URL=https://api.manus.im
NODE_ENV=development
```

Then run:
```bash
pnpm install
pnpm dev
```

---

**Last Updated:** December 24, 2025

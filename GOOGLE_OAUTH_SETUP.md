# Google OAuth Setup - EXACT Instructions

## ⚠️ CRITICAL: Follow These Steps EXACTLY

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/apis/credentials
2. Select your project (or create one if needed)

### Step 2: Find Your OAuth 2.0 Client
- Look for your Client ID (format: `xxx-xxx.apps.googleusercontent.com`)
- Click on it to edit

### Step 3: Configure EXACT URLs (Copy & Paste These)

#### Authorized JavaScript origins:
```
http://localhost:3000
```

#### Authorized redirect URIs:
```
http://localhost:3000/api/auth/callback/google
```

### ⚠️ IMPORTANT NOTES:
1. **NO trailing slashes** - Don't add `/` at the end
2. **Use http://** not https:// for localhost
3. **Port must be :3000** exactly
4. **Click SAVE** after adding

### Step 4: Wait for Propagation
- Changes can take 5-30 minutes to propagate
- Try clearing browser cache and cookies
- Use incognito/private window for testing

### Step 5: Test Authentication
1. Visit: http://localhost:3000
2. Click "Sign in with Google"
3. If still failing, wait longer (up to 1 hour in some cases)

## Current Configuration Status:
- ✅ Client ID: `[Your Client ID from Google Console]`
- ✅ Client Secret: `[Your Client Secret from Google Console]`
- ✅ NEXTAUTH_URL: `http://localhost:3000`
- ✅ Callback URL: `http://localhost:3000/api/auth/callback/google`

## Alternative Testing Method:
If Google is still not working after waiting:
1. Try using a different Google account
2. Create a new OAuth client in Google Console
3. Update the .env.local with new credentials

## Database Status:
- Using Supabase PostgreSQL
- Database URL configured and working
- Prisma schema deployed
- Ready to store user data once OAuth works
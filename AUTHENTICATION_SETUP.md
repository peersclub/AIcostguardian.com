# Authentication Setup Guide

This guide will help you set up Google OAuth authentication for the AI Credit Tracker application.

## Overview

The authentication system includes:
- 🔐 Google OAuth integration with NextAuth.js
- 🏢 Enterprise domain validation (blocks personal email domains)
- 🚫 Automatic rejection of gmail.com, yahoo.com, etc.
- ✅ Professional email domains only (company.com, business.org, etc.)
- 🔒 Session management and protected routes
- 📱 Responsive auth pages with error handling

## Setup Instructions

### 1. Configure Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen:
   - Application type: Web application
   - Name: AI Credit Tracker
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

### 2. Update Environment Variables

Update your `.env.local` file with your Google OAuth credentials:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-32-character-string"
```

**Important:** Replace the placeholder values with your actual Google OAuth credentials.

### 3. Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Or use this online generator: https://generate-secret.vercel.app/32

### 4. Domain Validation

The system automatically blocks these personal email domains:
- gmail.com
- yahoo.com  
- hotmail.com
- outlook.com
- aol.com
- icloud.com
- mail.com
- protonmail.com

Only business/enterprise email domains are allowed (e.g., company.com, business.org).

### 5. Test the Authentication

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "Sign up" or "Log in"
4. Try signing up with a Gmail account - it should be rejected
5. Try signing up with a business email - it should work

## Authentication Flow

1. **Sign Up/Sign In**: Users click Google OAuth button
2. **Domain Check**: System validates email domain
3. **Rejection**: Personal emails are redirected to error page
4. **Success**: Business emails proceed to dashboard/onboarding
5. **Session**: User session is maintained across page loads
6. **Protection**: Protected routes require authentication

## Error Handling

- **Invalid Domain**: Shows detailed error page with explanation
- **Access Denied**: Generic error handling
- **Network Issues**: Graceful error messages

## Features Implemented

✅ Google OAuth integration
✅ Domain validation (enterprise only)  
✅ Professional authentication pages
✅ Session management
✅ Protected routes middleware
✅ User dropdown with profile info
✅ Sign out functionality
✅ Error pages with helpful messaging
✅ Mobile-responsive design
✅ Loading states and animations

## Production Setup

For production deployment:

1. Update `NEXTAUTH_URL` to your production domain
2. Add production domain to Google OAuth settings
3. Use secure, unique `NEXTAUTH_SECRET`
4. Consider adding additional OAuth providers
5. Set up proper error monitoring

## Security Features

- Enterprise domain validation
- Secure session management
- CSRF protection (NextAuth.js built-in)
- No password storage (OAuth only)
- Automatic session expiration
- Protected API routes

## Next Steps

The authentication system is now ready. Consider adding:
- User profile management
- Team/organization features  
- Role-based access control
- SSO integration for enterprises
- User onboarding flow
- Database integration for user data
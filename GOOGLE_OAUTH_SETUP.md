# Google OAuth Setup Guide

## Overview
This application supports Google OAuth 2.0 for user login and signup. The implementation uses the Passport Google OAuth 2.0 strategy and supports both web and mobile clients.

## Prerequisites
1. Google Cloud Project created
2. OAuth 2.0 credentials generated (Client ID and Client Secret)
3. Authorized redirect URIs configured in Google Cloud Console

## Environment Variables

Add the following to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
GOOGLE_CALLBACK_URL=http://localhost:3000/user-auth/google/callback

# For mobile clients (already present)
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android_client_id>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios_client_id>
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<web_client_id>
```

## Getting Google OAuth Credentials

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API

### Step 2: Create OAuth 2.0 Credentials
1. Go to Credentials
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Select "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/user-auth/google/callback` (development)
   - `http://localhost:3000/user-auth/login/google` (for testing)
   - `http://localhost:3000/user-auth/signup/google` (for testing)
   - Your production domain

### Step 3: For Mobile Apps
1. Create separate OAuth 2.0 credentials for Android and iOS
2. Add the Client IDs to `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

## API Endpoints

### Google Login
**Endpoint:** `POST /user-auth/login/google`

**Request Body:**
```json
{
  "googleToken": "id_token_from_google_sign_in",
  "userInfo": {
    "sub": "google_user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://example.com/photo.jpg"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google login successful",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "fullName": "User Name",
    "email": "user@example.com",
    "phoneNumber": "1234567890",
    "role": "User"
  }
}
```

### Google Signup
**Endpoint:** `POST /user-auth/signup/google`

**Request Body:**
```json
{
  "googleToken": "id_token_from_google_sign_in",
  "userInfo": {
    "sub": "google_user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://example.com/photo.jpg"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google signup successful",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "fullName": "User Name",
    "email": "user@example.com",
    "phoneNumber": null,
    "role": "User"
  }
}
```

## Frontend Implementation

### React/Web Example
```javascript
import { GoogleLogin } from '@react-oauth/google';

function LoginComponent() {
  const handleGoogleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    
    // Decode the JWT to get user info
    const decodedToken = jwt_decode(credential);
    
    const response = await fetch('http://localhost:3000/user-auth/login/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        googleToken: credential,
        userInfo: {
          sub: decodedToken.sub,
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture
        }
      })
    });
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    // Redirect to dashboard
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => console.log('Login Failed')}
    />
  );
}
```

### React Native / Expo Example
```javascript
import * as Google from 'expo-google-app-auth';

async function handleGoogleLogin() {
  try {
    const result = await Google.logInAsync({
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      scopes: ['profile', 'email'],
    });

    if (result.type === 'success') {
      const response = await fetch('http://localhost:3000/user-auth/login/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleToken: result.idToken,
          userInfo: {
            sub: result.user.id,
            email: result.user.email,
            name: result.user.name,
            picture: result.user.photoUrl
          }
        })
      });

      const data = await response.json();
      await SecureStore.setItemAsync('token', data.token);
      // Navigate to home
    }
  } catch (error) {
    console.error('Google sign in failed:', error);
  }
}
```

## Database Schema Updates

The user schema now includes Google OAuth fields:
- `googleId`: Google user ID (stored when user authenticates with Google)
- `avatar`: User's profile picture from Google

When a user signs up with Google:
- A random password is generated (user doesn't need to remember it)
- `isVerified` is set to `true` automatically
- User can still update profile with phone number later

## Security Considerations

1. **Token Verification**: Google ID tokens are verified on the backend
2. **Account Linking**: If a user signs up with email/password and later tries to login with Google using the same email, the accounts are linked
3. **JWT Tokens**: Backend issues its own JWT tokens (separate from Google tokens)
4. **Password**: Google signup users get a random password that they can later reset

## Testing

### Using cURL
```bash
# Test Google Login
curl -X POST http://localhost:3000/user-auth/login/google \
  -H "Content-Type: application/json" \
  -d '{
    "googleToken": "your_google_id_token",
    "userInfo": {
      "sub": "123456789",
      "email": "user@example.com",
      "name": "Test User",
      "picture": "https://example.com/photo.jpg"
    }
  }'

# Test Google Signup
curl -X POST http://localhost:3000/user-auth/signup/google \
  -H "Content-Type: application/json" \
  -d '{
    "googleToken": "your_google_id_token",
    "userInfo": {
      "sub": "123456789",
      "email": "newuser@example.com",
      "name": "New User",
      "picture": "https://example.com/photo.jpg"
    }
  }'
```

## Troubleshooting

### Common Issues

1. **"GOOGLE_CLIENT_SECRET is missing"**
   - Make sure you've added `GOOGLE_CLIENT_SECRET` to your `.env` file

2. **"No account found with this email"**
   - User hasn't signed up yet, use Google Signup endpoint instead

3. **"An account with this email already exists"**
   - User already has an account, use Google Login endpoint

4. **Invalid token error**
   - Ensure the Google ID token is valid and not expired
   - Check that it matches the correct client ID

## Next Steps

1. Update frontend to use Google Sign-In SDK
2. Test with both web and mobile clients
3. Configure production domains in Google Cloud Console
4. Set up proper CORS configuration for frontend domains

## Files Created/Modified

- **Created:**
  - `src/strategies/google/google.strategy.ts` - Passport Google OAuth strategy
  - `src/features/user/userAuth/services/google-verification.service.ts` - Token verification
  - `src/features/user/userAuth/dtos/google-auth.dto.ts` - Request DTOs

- **Modified:**
  - `src/features/user/userAuth/services/userAuth.service.ts` - Added Google login/signup methods
  - `src/features/user/userAuth/controllers/user-auth/user-auth.controller.ts` - Added Google endpoints
  - `src/features/user/userAuth/userAuth.module.ts` - Registered Google strategy
  - `.env` - Added Google OAuth configuration

## References
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport Google OAuth 2.0 Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Expo Google Sign-In](https://docs.expo.dev/modules/expo-google-app-auth/)

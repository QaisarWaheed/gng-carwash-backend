# Apple OAuth Setup Guide

## Overview
This application supports Apple ID authentication for user login and signup. The implementation uses the Passport Apple OAuth strategy and supports both web and mobile clients.

## Prerequisites
1. Apple Developer Account
2. App ID created in Apple Developer Portal
3. Sign in with Apple capability enabled
4. Service ID created for your app
5. Private key (AuthKey_*.p8) generated

## Environment Variables

Add the following to your `.env` file:

```env
# Apple OAuth Configuration
APPLE_TEAM_ID=ABC123XYZ
APPLE_KEY_ID=ABC123DEFG
APPLE_BUNDLE_ID=com.yourcompany.yourapp
APPLE_KEY_FILE_PATH=path/to/AuthKey_ABC123DEFG.p8
APPLE_CALLBACK_URL=http://localhost:3000/user-auth/apple/callback
```

## Getting Apple OAuth Credentials

### Step 1: Apple Developer Account Setup
1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Sign in with your Apple ID

### Step 2: Create App ID
1. Go to Certificates, Identifiers & Profiles
2. Click "Identifiers" in the left menu
3. Click the "+" button to create a new identifier
4. Select "App IDs"
5. Select "App" and click "Continue"
6. Fill in the form:
   - App Name: Your app name
   - Bundle ID: `com.yourcompany.yourapp` (explicit)
7. Enable "Sign in with Apple" capability
8. Click "Continue" and "Register"

### Step 3: Create Service ID
1. In "Identifiers", click the "+" button again
2. Select "Services IDs"
3. Fill in:
   - App Name: Your app name
   - Identifier: Same as your Bundle ID or a web-specific ID
4. Enable "Sign in with Apple"
5. Click "Configure" and add Return URLs:
   - `http://localhost:3000/user-auth/apple/callback` (development)
   - Your production domain
6. Click "Continue" and "Register"

### Step 4: Generate Private Key
1. Go to "Keys" in the left menu
2. Click the "+" button
3. Name the key (e.g., "Apple Sign In Key")
4. Enable "Sign in with Apple"
5. Click "Configure" and select your App ID
6. Click "Continue" and "Register"
7. Click "Download"
8. Save the `AuthKey_KEYID.p8` file securely

### Step 5: Get Your Team ID
1. In the top right corner, click your name
2. Click "Membership"
3. Copy your Team ID

### Step 6: Configure Environment Variables
Use the values from above:
- `APPLE_TEAM_ID`: Your Team ID from Membership
- `APPLE_KEY_ID`: The Key ID from the private key file name
- `APPLE_BUNDLE_ID`: Your App's Bundle ID
- `APPLE_KEY_FILE_PATH`: Path to your downloaded `AuthKey_*.p8` file

## API Endpoints

### Apple Login
**Endpoint:** `POST /user-auth/login/apple`

**Request Body:**
```json
{
  "identityToken": "identity_token_from_apple_sign_in",
  "userInfo": {
    "sub": "apple_user_id",
    "email": "user@example.com",
    "name": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Apple login successful",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "email": "user@example.com",
    "phoneNumber": "1234567890",
    "role": "User"
  }
}
```

### Apple Signup
**Endpoint:** `POST /user-auth/signup/apple`

**Request Body:**
```json
{
  "identityToken": "identity_token_from_apple_sign_in",
  "userInfo": {
    "email": "user@example.com",
    "name": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Apple signup successful",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "email": "user@example.com",
    "phoneNumber": null,
    "role": "User"
  }
}
```

## Frontend Implementation

### React/Web Example
```javascript
import SignInWithAppleButton from 'react-apple-login';

function LoginComponent() {
  const handleAppleSuccess = async (response) => {
    const { identityToken, user } = response;
    
    const appleUserInfo = {
      sub: user?.user_id || user?.sub,
      email: user?.email || response.email,
      name: {
        firstName: user?.name?.firstName,
        lastName: user?.name?.lastName,
      }
    };
    
    const result = await fetch('http://localhost:3000/user-auth/login/apple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identityToken: identityToken,
        userInfo: appleUserInfo
      })
    });
    
    const data = await result.json();
    localStorage.setItem('token', data.token);
    // Redirect to dashboard
  };

  return (
    <SignInWithAppleButton
      authorizationRequestOptions={{
        requestedScopes: [AppleID.Scope.Email, AppleID.Scope.FullName],
      }}
      onSuccess={handleAppleSuccess}
      onError={(error) => console.log('Apple sign in failed:', error)}
    />
  );
}
```

### React Native / Expo Example
```javascript
import * as AppleAuthentication from 'expo-apple-authentication';

async function handleAppleLogin() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const response = await fetch('http://localhost:3000/user-auth/login/apple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identityToken: credential.identityToken,
        userInfo: {
          sub: credential.user,
          email: credential.email,
          name: {
            firstName: credential.fullName?.givenName,
            lastName: credential.fullName?.familyName,
          }
        }
      })
    });

    const data = await response.json();
    await SecureStore.setItemAsync('token', data.token);
    // Navigate to home
  } catch (error) {
    console.error('Apple sign in failed:', error);
  }
}
```

## Database Schema Updates

The user schema now includes Apple OAuth fields:
- `appleId`: Apple user ID (stored when user authenticates with Apple)

When a user signs up with Apple:
- A random password is generated (user doesn't need to remember it)
- `isVerified` is set to `true` automatically
- User can update profile with phone number later

## Security Considerations

1. **Token Verification**: Apple ID tokens are verified on the backend
2. **Account Linking**: If a user signs up with email/password and later tries to login with Apple using the same email, the accounts are linked
3. **JWT Tokens**: Backend issues its own JWT tokens (separate from Apple tokens)
4. **Private Key**: Keep your `AuthKey_*.p8` file secure and never commit to version control
5. **Email Privacy**: Some users may choose to hide their real email - handle gracefully

## Email Privacy Relay

Apple allows users to hide their real email and use a relay email instead (`*.privaterelay.appleid.com`). Handle this by:

1. Accept relay emails in signup
2. Store the relay email as the user's email
3. When user provides real email later, update the account
4. Map both emails to the same account if needed

## Testing

### Using cURL
```bash
# Test Apple Login
curl -X POST http://localhost:3000/user-auth/login/apple \
  -H "Content-Type: application/json" \
  -d '{
    "identityToken": "your_apple_identity_token",
    "userInfo": {
      "sub": "001234.567890abcdef.1234",
      "email": "user@example.com",
      "name": {
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  }'

# Test Apple Signup
curl -X POST http://localhost:3000/user-auth/signup/apple \
  -H "Content-Type: application/json" \
  -d '{
    "identityToken": "your_apple_identity_token",
    "userInfo": {
      "email": "newuser@example.com",
      "name": {
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  }'
```

## Troubleshooting

### Common Issues

1. **"APPLE_TEAM_ID is missing"**
   - Make sure you've added all Apple configuration variables to `.env`

2. **"No account found with this email"**
   - User hasn't signed up yet, use Apple Signup endpoint instead
   - Check if email privacy relay is being used

3. **"An account with this email already exists"**
   - User already has an account, use Apple Login endpoint

4. **Invalid token error**
   - Ensure the identity token is valid and not expired
   - Token must be issued within 10 minutes

5. **Email is required error**
   - User may have chosen email privacy relay
   - Implement graceful handling for relay emails

## Next Steps

1. Get Apple Developer Account credentials
2. Update `.env` with your Apple credentials
3. Download your private key and store securely
4. Implement Apple Sign-In SDK in frontend
5. Test with both web and mobile clients
6. Configure production return URLs in Apple Developer Portal

## Files Created/Modified

- **Created:**
  - `src/strategies/apple/apple.strategy.ts` - Passport Apple OAuth strategy
  - `src/features/user/userAuth/services/apple-verification.service.ts` - Token verification
  - `src/features/user/userAuth/dtos/apple-auth.dto.ts` - Request DTOs

- **Modified:**
  - `src/features/user/userAuth/services/userAuth.service.ts` - Added Apple login/signup methods
  - `src/features/user/userAuth/controllers/user-auth/user-auth.controller.ts` - Added Apple endpoints
  - `src/features/user/userAuth/entities/userAuth.entity.ts` - Added appleId field
  - `src/features/user/userAuth/userAuth.module.ts` - Registered Apple strategy
  - `.env` - Added Apple OAuth configuration

## References
- [Apple Sign in with Apple Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Passport Apple Strategy](https://www.npmjs.com/package/passport-apple)
- [Apple Developer Portal](https://developer.apple.com/account)
- [Token Validation Guide](https://developer.apple.com/documentation/sign_in_with_apple/verifying_a_user/)

# Getting Apple OAuth Credentials - Step by Step

## Overview
You need 5 pieces of information from Apple Developer Portal:
1. **APPLE_TEAM_ID** - Your organization/team identifier
2. **APPLE_KEY_ID** - Identifier from your private key
3. **APPLE_BUNDLE_ID** - Your app's unique identifier
4. **APPLE_KEY_FILE_PATH** - Location of your private key file
5. **APPLE_CALLBACK_URL** - Where Apple redirects after authentication

---

## Step 1: Get Your APPLE_TEAM_ID

### Location: Apple Developer Account Settings
1. Go to https://developer.apple.com/account
2. Sign in with your Apple ID (create one if you don't have it)
3. Click your profile icon in the top right corner
4. Select "Membership" from dropdown

**You'll see:**
```
Team ID
ABC123XYZ
```

Copy this 9-character code → This is your **APPLE_TEAM_ID**

**Example:**
```env
APPLE_TEAM_ID=ABC123XYZ
```

---

## Step 2: Create App ID & Get APPLE_BUNDLE_ID

### Location: Certificates, Identifiers & Profiles → Identifiers

1. Go to https://developer.apple.com/account/resources/identifiers/list
2. Click the **"+"** button (top left)
3. Select **"App IDs"** → Click **"Continue"**
4. Select **"App"** → Click **"Continue"**

**Fill in the form:**
```
Description: My Car Wash App
Bundle ID: com.mycompany.carwash  ← This is your APPLE_BUNDLE_ID
```

5. Scroll down and enable **"Sign in with Apple"**
6. Click **"Continue"** → **"Register"**

**Copy your Bundle ID:**
```env
APPLE_BUNDLE_ID=com.mycompany.carwash
```

**Important:** Use reverse domain notation (com.yourcompany.appname)

---

## Step 3: Create a Service ID (for Web)

If you're using Apple Sign-In on web, you need a separate Service ID:

1. Go to https://developer.apple.com/account/resources/identifiers/list
2. Click **"+"** button
3. Select **"Services IDs"** → Click **"Continue"**
4. Select **"Services"** → Click **"Continue"**

**Fill in:**
```
Description: My Car Wash Web Service
Identifier: com.mycompany.carwash.web  ← Use this if different from app
```

5. Enable **"Sign in with Apple"**
6. Click **"Configure"**

**Add Return URLs:**
- `http://localhost:3000/user-auth/apple/callback` (development)
- `https://yourdomain.com/user-auth/apple/callback` (production)

7. Click **"Done"** → **"Continue"** → **"Register"**

---

## Step 4: Create Private Key & Get APPLE_KEY_ID

### Location: Certificates, Identifiers & Profiles → Keys

1. Go to https://developer.apple.com/account/resources/authkeys/list
2. Click **"+"** button (top left)

**Create Key:**
```
Key Name: Apple Sign In Key  (or any descriptive name)
```

3. Enable the checkbox: **"Sign in with Apple"**
4. Click **"Configure"**
5. Select your App ID (from Step 2)
6. Click **"Done"** → **"Continue"** → **"Register"**

**Download Your Private Key:**
- Click the **"Download"** button
- A file named `AuthKey_XXXXXXXXXX.p8` will download
  - The `XXXXXXXXXX` part is your **APPLE_KEY_ID**
  - Save this file in your project: `/keys/AuthKey_XXXXXXXXXX.p8`

**Example:**
```env
APPLE_KEY_ID=XXXXXXXXXX
APPLE_KEY_FILE_PATH=keys/AuthKey_XXXXXXXXXX.p8
```

⚠️ **Important:** 
- Keep this `.p8` file private - don't commit to Git
- Add it to `.gitignore`
- The file contains your private key - treat it like a password
- You can only download it once - save it securely

---

## Step 5: Set APPLE_CALLBACK_URL

This is where Apple redirects after the user authenticates:

**Development:**
```env
APPLE_CALLBACK_URL=http://localhost:3000/user-auth/apple/callback
```

**Production:**
```env
APPLE_CALLBACK_URL=https://yourdomain.com/user-auth/apple/callback
```

Make sure this matches the Return URL you configured in Step 3.

---

## Complete .env Example

Once you have all values:

```env
APPLE_TEAM_ID=ABC123XYZ
APPLE_KEY_ID=XXXXXXXXXX
APPLE_BUNDLE_ID=com.mycompany.carwash
APPLE_KEY_FILE_PATH=keys/AuthKey_XXXXXXXXXX.p8
APPLE_CALLBACK_URL=http://localhost:3000/user-auth/apple/callback
```

---

## Quick Reference Table

| Variable | Where to Find | Example | Notes |
|----------|---------------|---------|-------|
| APPLE_TEAM_ID | Account → Membership | ABC123XYZ | 9-char code |
| APPLE_BUNDLE_ID | Identifiers → App ID | com.mycompany.carwash | Reverse domain format |
| APPLE_KEY_ID | AuthKey file name | XXXXXXXXXX | From downloaded .p8 filename |
| APPLE_KEY_FILE_PATH | Your file system | keys/AuthKey_ABC123.p8 | Keep secure, add to .gitignore |
| APPLE_CALLBACK_URL | You define it | http://localhost:3000/user-auth/apple/callback | Must match Apple Portal |

---

## File Structure Setup

After downloading your private key:

```
gng-carwash-backend/
├── .env
├── .gitignore (add: keys/*)
├── keys/
│   └── AuthKey_XXXXXXXXXX.p8  ← Your private key
├── src/
├── package.json
└── ...
```

**Update .gitignore:**
```
# Add to .gitignore
keys/
*.p8
```

---

## Verification Checklist

- [ ] Have Apple Developer Account ($99/year)
- [ ] Created App ID with Bundle ID
- [ ] Enabled "Sign in with Apple" on App ID
- [ ] Created Service ID (for web support)
- [ ] Downloaded private key file (.p8)
- [ ] Added Return URLs to Service ID
- [ ] Have Team ID from Membership page
- [ ] Updated .env with all 5 values
- [ ] Stored .p8 file in keys/ directory
- [ ] Added keys/ to .gitignore

---

## Common Issues

### "APPLE_TEAM_ID is undefined"
**Solution:** Copy from Account → Membership page (not your Apple ID, the 9-char Team ID)

### "Cannot find module 'keys/AuthKey...'"
**Solution:** Make sure:
1. Private key file is downloaded and saved in correct path
2. Filename matches APPLE_KEY_ID
3. Path in APPLE_KEY_FILE_PATH is correct

### "Invalid return URL"
**Solution:** Make sure APPLE_CALLBACK_URL exactly matches URL in Apple Portal

### "Bundle ID not found"
**Solution:** Create App ID first, then use its Bundle ID in APPLE_BUNDLE_ID variable

---

## Support

- Apple Developer Help: https://developer.apple.com/help/app-store-connect/
- Sign in with Apple Guide: https://developer.apple.com/sign-in-with-apple/
- Generate credentials: https://developer.apple.com/account/resources/

---

## Next Steps

1. ✅ Get all 5 credentials from Apple
2. ✅ Update .env file
3. ✅ Download and secure private key file
4. ✅ Test Apple login/signup endpoints
5. ✅ Deploy to production with production URLs

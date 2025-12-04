# Apple OAuth - Quick Reference Card

## 📍 Where to Get Each Credential

### APPLE_TEAM_ID
**URL:** https://developer.apple.com/account  
**Path:** Account (top right) → Membership  
**What it looks like:** `ABC123XYZ` (9 characters)  
**⏱️ Time:** 30 seconds

### APPLE_KEY_ID  
**URL:** https://developer.apple.com/account/resources/authkeys/list  
**What it looks like:** Extracted from `AuthKey_XXXXXXXXXX.p8` filename  
**⏱️ Time:** 1-2 minutes to create & download

### APPLE_BUNDLE_ID
**URL:** https://developer.apple.com/account/resources/identifiers/list  
**What it looks like:** `com.yourcompany.yourapp`  
**⏱️ Time:** 1-2 minutes to create

### APPLE_KEY_FILE_PATH
**What it is:** Path to your downloaded private key  
**Where to save:** Create `keys/` folder in project root  
**File name:** `AuthKey_XXXXXXXXXX.p8` (where XXXXXXXXXX = APPLE_KEY_ID)  
**⏱️ Time:** 1 minute to save

### APPLE_CALLBACK_URL
**Development:** `http://localhost:3000/user-auth/apple/callback`  
**Production:** `https://yourdomain.com/user-auth/apple/callback`  
**Where configured:** Service ID → Configure → Return URLs

---

## 🚀 Quick Setup (5 minutes)

### 1. Get Team ID (30 sec)
```
1. Go to developer.apple.com/account
2. Sign in
3. Top right → Account → Membership
4. Copy "Team ID" (looks like: ABC123XYZ)
```

### 2. Create App ID (1 min)
```
1. Go to Identifiers
2. Click +
3. Select "App IDs" → Continue
4. Enter Bundle ID: com.yourcompany.carwash
5. Enable "Sign in with Apple"
6. Register
```

### 3. Create Service ID (1 min)
```
1. Go to Identifiers
2. Click +
3. Select "Services IDs" → Continue
4. Enable "Sign in with Apple" → Configure
5. Add Return URL: http://localhost:3000/user-auth/apple/callback
6. Register
```

### 4. Create & Download Private Key (2 min)
```
1. Go to Keys
2. Click +
3. Enable "Sign in with Apple" → Configure
4. Select your App ID
5. Download → Save to: keys/AuthKey_KEYID.p8
6. Note the Key ID from filename
```

### 5. Update .env (1 min)
```env
APPLE_TEAM_ID=ABC123XYZ
APPLE_KEY_ID=XXXXXXXXXX
APPLE_BUNDLE_ID=com.yourcompany.carwash
APPLE_KEY_FILE_PATH=keys/AuthKey_XXXXXXXXXX.p8
APPLE_CALLBACK_URL=http://localhost:3000/user-auth/apple/callback
```

---

## 📋 Essential URLs

| What | URL |
|------|-----|
| Membership (get Team ID) | https://developer.apple.com/account/ |
| Identifiers (App ID & Services) | https://developer.apple.com/account/resources/identifiers/list |
| Keys (Private Key) | https://developer.apple.com/account/resources/authkeys/list |
| Documentation | https://developer.apple.com/sign-in-with-apple/ |

---

## ⚠️ Important Notes

1. **Private Key File (.p8)**
   - Download it immediately - can't download again!
   - Add `keys/` to `.gitignore` - never commit it!
   - Keep it secure like a password

2. **Bundle ID Format**
   - Must be: `com.yourcompany.appname`
   - Can't be changed once created
   - Same for iOS and Android

3. **Return URLs**
   - Must exactly match `APPLE_CALLBACK_URL`
   - Add both dev and production URLs
   - Dev: `http://localhost:3000/user-auth/apple/callback`

4. **Team ID**
   - Not the same as your Apple ID
   - Found in Membership section
   - Same for all your apps

---

## 🔍 Verification

After setting up, your .env should have:

```env
✓ APPLE_TEAM_ID=ABC123XYZ          (9 chars)
✓ APPLE_KEY_ID=XXXXXXXXXX           (varies)
✓ APPLE_BUNDLE_ID=com.x.y           (reverse domain)
✓ APPLE_KEY_FILE_PATH=keys/Auth...  (file exists)
✓ APPLE_CALLBACK_URL=http://...     (matches Service ID)
```

---

## 💡 Pro Tips

- **Save the private key immediately** - You only get one chance to download
- **Use descriptive names** - Makes it easier to identify keys later
- **Test in development first** - Then add production URLs
- **Document your Team ID** - You'll need it for multiple apps
- **Keep .gitignore updated** - Essential for security

---

## 🆘 Still Confused?

1. Read detailed guide: `APPLE_OAUTH_SETUP.md`
2. See visual guide: `APPLE_SETUP_VISUAL_GUIDE.md`
3. Check Apple docs: https://developer.apple.com/sign-in-with-apple/

---

## ✅ Next Steps

- [ ] Complete Quick Setup above
- [ ] Update .env file
- [ ] Save .p8 file to keys/ folder
- [ ] Add keys/ to .gitignore
- [ ] Test Apple login endpoint
- [ ] Deploy to production

# Apple OAuth Setup - Visual Guide

## Visual Walkthrough

### 1️⃣ Get APPLE_TEAM_ID

```
🌐 https://developer.apple.com/account
        ↓
    [Sign In]
        ↓
    👤 Profile Icon (top right)
        ↓
    [Membership]
        ↓
    📋 You'll see:
    ┌─────────────────────────┐
    │ Team ID                 │
    │ ABC123XYZ    ← COPY THIS │
    └─────────────────────────┘
```

**Your .env:**
```env
APPLE_TEAM_ID=ABC123XYZ
```

---

### 2️⃣ Create App ID & Get APPLE_BUNDLE_ID

```
🌐 https://developer.apple.com/account/resources/identifiers/list
        ↓
    [+ Button]
        ↓
    Select "App IDs" → [Continue]
        ↓
    Select "App" → [Continue]
        ↓
    Fill Form:
    ┌─────────────────────────────────────┐
    │ Description: My Car Wash App        │
    │ Bundle ID: com.mycompany.carwash ✓  │
    │ ☑ Sign in with Apple (enable)       │
    └─────────────────────────────────────┘
        ↓
    [Continue] → [Register]
```

**Your .env:**
```env
APPLE_BUNDLE_ID=com.mycompany.carwash
```

---

### 3️⃣ Create Service ID (for Web)

```
🌐 Same page as Step 2
        ↓
    [+ Button]
        ↓
    Select "Services IDs" → [Continue]
        ↓
    Fill Form:
    ┌──────────────────────────────────────┐
    │ Description: Car Wash Web Service    │
    │ Identifier: com.mycompany.carwash.web│
    │ ☑ Sign in with Apple (enable)        │
    └──────────────────────────────────────┘
        ↓
    [Configure]
        ↓
    Add Return URLs:
    ┌──────────────────────────────────────┐
    │ • http://localhost:3000/...          │
    │ • https://yourdomain.com/...         │
    └──────────────────────────────────────┘
        ↓
    [Done] → [Continue] → [Register]
```

**Your .env:**
```env
APPLE_CALLBACK_URL=http://localhost:3000/user-auth/apple/callback
```

---

### 4️⃣ Create Private Key & Get APPLE_KEY_ID

```
🌐 https://developer.apple.com/account/resources/authkeys/list
        ↓
    [+ Button]
        ↓
    Fill Form:
    ┌──────────────────────────────────┐
    │ Key Name: Apple Sign In Key      │
    │ ☑ Sign in with Apple (enable)    │
    └──────────────────────────────────┘
        ↓
    [Configure]
        ↓
    Select your App ID (from Step 2)
        ↓
    [Done] → [Continue] → [Register]
        ↓
    [Download]  ← Download your key!
        ↓
    📥 File Downloaded:
    AuthKey_XXXXXXXXXX.p8
             ^^^^^^^^^^
             This is your APPLE_KEY_ID
```

**Your .env:**
```env
APPLE_KEY_ID=XXXXXXXXXX
APPLE_KEY_FILE_PATH=keys/AuthKey_XXXXXXXXXX.p8
```

**Save the file:**
```
gng-carwash-backend/
├── keys/
│   └── AuthKey_XXXXXXXXXX.p8  ← Save here
├── .gitignore  ← Add "keys/" to this
├── src/
├── .env
└── ...
```

---

## Complete Checklist

- [ ] Go to https://developer.apple.com/account
- [ ] Sign in with Apple ID
- [ ] Click Membership → Copy Team ID
  - [ ] `APPLE_TEAM_ID=ABC123XYZ`

- [ ] Go to Identifiers → Create App ID
- [ ] Enable "Sign in with Apple"
- [ ] Copy Bundle ID
  - [ ] `APPLE_BUNDLE_ID=com.mycompany.carwash`

- [ ] Go to Services IDs → Create Service ID  
- [ ] Configure with Return URLs
  - [ ] `APPLE_CALLBACK_URL=http://localhost:3000/user-auth/apple/callback`

- [ ] Go to Keys → Create Private Key
- [ ] Download `AuthKey_*.p8` file
- [ ] Note the Key ID from filename
  - [ ] `APPLE_KEY_ID=XXXXXXXXXX`
  - [ ] `APPLE_KEY_FILE_PATH=keys/AuthKey_XXXXXXXXXX.p8`

- [ ] Update your `.env` with all values
- [ ] Save `.p8` file to `keys/` folder
- [ ] Add `keys/` to `.gitignore`

---

## .env Template

Copy and fill in your values:

```env
# Apple OAuth (See checklist above)
APPLE_TEAM_ID=                    # From: Account → Membership
APPLE_KEY_ID=                     # From: AuthKey_[THIS].p8 filename
APPLE_BUNDLE_ID=                  # From: Identifiers → App ID
APPLE_KEY_FILE_PATH=keys/AuthKey_.p8  # Path to your .p8 file
APPLE_CALLBACK_URL=http://localhost:3000/user-auth/apple/callback
```

---

## Troubleshooting

**Q: Where do I find APPLE_TEAM_ID?**
A: Account Settings → Membership tab → Shows as "Team ID"

**Q: What if I don't have .p8 file?**
A: Go to Keys, create new key, download it immediately (can only download once)

**Q: Can I use the same values for iOS and Android?**
A: Use the same Team ID, Key ID, and Bundle ID for both

**Q: What if Bundle ID format is wrong?**
A: Must be reverse domain format: `com.yourcompany.yourapp`

**Q: Do I need to commit .p8 file to Git?**
A: NO! Add `keys/` to .gitignore - it's your private key!

---

## More Resources

- 📖 Full Setup Guide: See `APPLE_OAUTH_SETUP.md`
- 🔗 Apple Developer: https://developer.apple.com/account
- 📚 Sign in with Apple: https://developer.apple.com/sign-in-with-apple/
- ❓ Get Help: https://developer.apple.com/help/app-store-connect/

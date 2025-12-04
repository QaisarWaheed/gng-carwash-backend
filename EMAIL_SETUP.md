# Email Service Setup Guide

## Environment Variables

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Gmail Setup (Recommended)

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google will generate a 16-character password
4. Use this password as `EMAIL_PASSWORD` in `.env`

**Note:** You must have 2-factor authentication enabled on your Google account

## Email Service Features

The email service includes:

### 1. OTP Generation & Verification
```typescript
// Generate OTP
const otp = await otpService.generateOtp(email, 'signup');
await emailService.sendOtpEmail(email, otp, 'signup');

// Verify OTP
await otpService.verifyOtp(email, otpFromUser, 'signup');
```

### 2. Password Reset Email
```typescript
const resetLink = `https://yourapp.com/reset-password?token=${token}`;
await emailService.sendPasswordResetEmail(email, resetLink);
```

### 3. Email Verification
```typescript
const verificationLink = `https://yourapp.com/verify-email?token=${token}`;
await emailService.sendVerificationEmail(email, verificationLink);
```

## Supported OTP Purposes

- `signup` - Account verification during registration
- `password-reset` - Password reset requests
- `email-change` - Email address change verification

## OTP Details

- **Length:** 6 digits
- **Expiration:** 10 minutes
- **One per purpose:** Generates new OTP, deletes old ones

## Integration Example

```typescript
// In your UserAuth service
async forgotPassword(email: string) {
  const user = await this.userModel.findOne({ email });
  if (!user) throw new NotFoundException('User not found');
  
  // Generate and send OTP
  const otp = await this.otpService.generateOtp(email, 'password-reset');
  await this.emailService.sendOtpEmail(email, otp, 'password-reset');
  
  return { message: 'OTP sent to email' };
}

async verifyOtpAndResetPassword(email: string, otp: string, newPassword: string) {
  // Verify OTP
  await this.otpService.verifyOtp(email, otp, 'password-reset');
  
  // Reset password
  const user = await this.userModel.findOne({ email });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  
  // Clean up OTP
  await this.otpService.deleteOtp(email, 'password-reset');
  
  return { message: 'Password reset successfully' };
}
```

## Database Cleanup

OTP records are automatically deleted after:
- 10 minutes (expiration)
- Verification
- Manual cleanup via `deleteOtp()` method

You can set up a scheduled job to clean expired OTPs:
```typescript
@Cron('0 * * * *') // Every hour
async cleanupExpiredOtps() {
  await this.otpService.cleanupExpiredOtps();
}
```

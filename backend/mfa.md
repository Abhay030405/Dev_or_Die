# MFA System Documentation

## Overview
Multi-Factor Authentication system supporting TOTP, SMS, Email, and backup codes.

## Features
- **TOTP (Google Authenticator)**: Time-based OTP with QR code generation
- **SMS OTP**: Phone-based verification (6-digit codes, 10min expiry)
- **Email OTP**: Email-based verification
- **Backup Codes**: 10 one-time recovery codes for account access

## Models
- **MFAMethod**: TOTP, SMS, Email, Backup Codes
- **MFASetupRequest/Response**: Setup flows with QR codes and secrets
- **MFAVerification**: OTP verification with attempt tracking
- **MFAConfig**: User's MFA configuration and preferences
- **MFAStatus**: Current MFA state for user

## API Endpoints
- `POST /api/mfa/setup/totp` - Setup Google Authenticator (returns QR + secret)
- `POST /api/mfa/setup/sms` - Setup SMS 2FA with phone number
- `POST /api/mfa/setup/email` - Setup email OTP
- `POST /api/mfa/verify` - Verify OTP code
- `GET /api/mfa/status` - Get user's MFA status
- `POST /api/mfa/regenerate-backup-codes` - Generate new backup codes
- `POST /api/mfa/disable` - Disable MFA for user

## Security Features
- TOTP with ±30 second time window
- OTP expiry (10 minutes)
- Failed attempt tracking
- Backup code one-time use enforcement
- Rate limiting on verification attempts

## Implementation
- **pyotp**: TOTP generation/verification
- **qrcode**: QR code generation for TOTP setup
- **MongoDB Collections**: mfa_configs, otp_attempts, backup_codes, totp_setups

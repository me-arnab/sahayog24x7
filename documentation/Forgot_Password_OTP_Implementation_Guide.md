# Sahayog 24x7 -- Forgot Password (OTP via Email) Implementation Guide

## Goal

Implement a secure **Forgot Password** flow for citizens using **React +
Express + MongoDB + Nodemailer**.

------------------------------------------------------------------------

## User Flow

``` text
Login
   ↓
Forgot Password
   ↓
Enter Email
   ↓
Backend checks whether the email exists
   ↓
Generate 6-digit OTP
   ↓
Send OTP to the user's email using Nodemailer
   ↓
User enters OTP
   ↓
Backend verifies OTP
   ↓
User enters:
- New Password
- Confirm New Password
   ↓
Backend hashes the password with bcrypt
   ↓
Update password in MongoDB
   ↓
Redirect to Login
```

------------------------------------------------------------------------

# Backend Requirements

## 1. User Model

Add the following fields:

``` js
otp: {
  type: String,
  default: null
},

otpExpires: {
  type: Date,
  default: null
}
```

> Prefer hashing the OTP before storing it.

------------------------------------------------------------------------

## 2. API Endpoints

### POST /api/auth/forgot-password

Request:

``` json
{
  "email": "user@example.com"
}
```

Tasks: - Validate email. - Check whether the user exists. - Generate a
random 6-digit OTP. - Store the OTP and expiration time (5 minutes). -
Send the OTP using Nodemailer. - Return a success response.

------------------------------------------------------------------------

### POST /api/auth/verify-otp

Request:

``` json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Tasks: - Find the user. - Verify the OTP. - Check whether it has
expired. - Return success or an appropriate error.

------------------------------------------------------------------------

### POST /api/auth/reset-password

Request:

``` json
{
  "email": "user@example.com",
  "password": "NewPassword123"
}
```

Tasks: - Validate password. - Hash with bcrypt. - Update the user's
password. - Clear the OTP and expiration fields. - Return success.

------------------------------------------------------------------------

# Frontend Pages

## Login

-   Email
-   Password
-   Forgot Password link

## Forgot Password

-   Email input
-   Send OTP button

## Verify OTP

-   6-digit OTP input
-   Verify button
-   Resend OTP button (after cooldown)

## Reset Password

-   New Password
-   Confirm Password
-   Change Password button

## Success

-   Password changed successfully
-   Redirect to Login

------------------------------------------------------------------------

# Security Requirements

-   Hash passwords using bcrypt.
-   Prefer hashing OTPs before storing.
-   OTP expires after 5 minutes.
-   Clear OTP after successful password reset.
-   Limit verification attempts.
-   Add resend cooldown (30--60 seconds).
-   Do not reveal whether an email exists beyond generic responses if
    desired.

------------------------------------------------------------------------

# Suggested Project Structure

``` text
backend/
├── controllers/
│   └── authController.js
├── routes/
│   └── auth.js
├── models/
│   └── User.js
└── utils/
    └── sendOTP.js

frontend/
├── pages/
│   ├── Login.tsx
│   ├── ForgotPassword.tsx
│   ├── VerifyOTP.tsx
│   └── ResetPassword.tsx
```

------------------------------------------------------------------------

# Acceptance Criteria

-   User can request an OTP by email.
-   OTP is delivered via Nodemailer.
-   OTP expires after 5 minutes.
-   Invalid or expired OTPs are rejected.
-   Password is updated only after successful OTP verification.
-   Password is stored as a bcrypt hash.
-   OTP data is cleared after a successful reset.
-   Existing login continues to work with the new password.

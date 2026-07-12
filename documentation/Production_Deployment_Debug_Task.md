# Production Deployment Debug Task (Render + Netlify)

## Project Stack

-   Frontend: React + TypeScript + Vite
-   Hosting: Netlify
-   Backend: Node.js + Express
-   Hosting: Render
-   Database: MongoDB Atlas

Everything works correctly on localhost. Only the deployed version has
issues.

## Current Problems

### Forgot Password

-   Login works with the same email.
-   User exists in MongoDB.
-   Forgot Password hangs or reports user not found.
-   OTP email is never delivered in production.

### Contact Us

-   Works on localhost.
-   Production request to `/api/contact/submit` returns **504 Gateway
    Timeout**.

### Render Logs

Backend logs stop at: - Checking email configuration - Creating
Nodemailer transporter - Verifying SMTP transporter

Nothing is logged afterwards.

## Tasks

1.  Search the backend for:

    -   `createTransport(`
    -   `transporter.verify`
    -   `sendMail`
    -   `EMAIL_USER`
    -   `EMAIL_PASS`

2.  Remove every `transporter.verify()` call.

3.  Create `backend/utils/sendEmail.js`:

    -   Create transporter once.
    -   Export `sendEmail()`.
    -   Reuse it from all controllers.

4.  Configure transporter using:

``` js
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});
```

5.  Add logging before send, after success and on failure.

6.  Trace and verify the full Forgot Password flow: Frontend -\> Route
    -\> Controller -\> Find User -\> Generate OTP -\> Save OTP -\> Send
    Email -\> Success.

7.  Trace and verify the Contact Us flow: Frontend -\> Route -\>
    Controller -\> Send Email -\> Success.

8.  Verify Render environment variables:

-   MONGODB_URI
-   EMAIL_USER
-   EMAIL_PASS
-   JWT_SECRET

9.  Verify frontend API configuration and Netlify proxy/redirects.

10. Inspect for production-only issues:

-   Missing await
-   Hanging promises
-   SMTP timeout
-   Mongo timeout
-   CORS
-   Environment mismatch

## Deliverables

Provide: - Root cause analysis - Files modified - Exact changes - Why
localhost worked - Why production failed - Why Netlify returned 504 -
Confirmation that Contact Us and Forgot Password now work in production.

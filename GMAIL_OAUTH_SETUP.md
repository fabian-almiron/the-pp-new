# Gmail OAuth Token Setup Guide

## Error: `invalid_grant`

If you're seeing `invalid_grant` errors when sending emails, your Gmail refresh token has expired or is invalid. You need to regenerate it.

## Quick Fix: Regenerate Gmail Refresh Token

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project (or create one)
3. Go to **APIs & Services** → **Credentials**

### Step 2: Create OAuth 2.0 Credentials (if not already created)
1. Click **Create Credentials** → **OAuth client ID**
2. Application type: **Web application**
3. Authorized redirect URIs: Add your redirect URI (e.g., `http://localhost:3000/api/auth/callback/gmail`)

### Step 3: Generate Refresh Token

**Option A: Using OAuth 2.0 Playground (Easiest)**
1. Go to: https://developers.google.com/oauthplayground/
2. Click the gear icon (⚙️) in top right
3. Check "Use your own OAuth credentials"
4. Enter your **Client ID** and **Client Secret**
5. In the left panel, find **Gmail API v1**
6. Select: `https://www.googleapis.com/auth/gmail.send`
7. Click **Authorize APIs**
8. Sign in and grant permissions
9. Click **Exchange authorization code for tokens**
10. Copy the **Refresh token** from the response

**Option B: Using Node.js Script**
Create a file `get-gmail-token.js`:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'YOUR_REDIRECT_URI'
);

const scopes = ['https://www.googleapis.com/auth/gmail.send'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

console.log('Authorize this app by visiting this url:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
  rl.close();
  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    console.log('Refresh Token:', token.refresh_token);
    console.log('Access Token:', token.access_token);
  });
});
```

Run: `node get-gmail-token.js`

### Step 4: Update Environment Variables

Add/update these in your `.env` file:

```env
GMAIL_CLIENT_ID=your_client_id_here
GMAIL_CLIENT_SECRET=your_client_secret_here
GMAIL_REFRESH_TOKEN=your_new_refresh_token_here
GMAIL_REDIRECT_URI=http://localhost:3000/api/auth/callback/gmail
GMAIL_USER=your-email@gmail.com
```

### Step 5: Restart Your Server

After updating the environment variables, restart your Next.js server.

## Troubleshooting

- **Token expires**: Refresh tokens can expire if:
  - The user revokes access
  - The token hasn't been used in 6 months
  - The OAuth app is in testing mode (tokens expire after 7 days)

- **Solution**: Regenerate the refresh token using the steps above

## Alternative: Use a Service Like SendGrid or Resend

If Gmail OAuth is too complex, consider using:
- **Resend** (recommended for Next.js)
- **SendGrid**
- **AWS SES**
- **Postmark**

These services are easier to set up and more reliable for production use.


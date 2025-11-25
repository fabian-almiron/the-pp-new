import { google } from 'googleapis';

// Initialize Gmail API
const getGmailClient = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
};

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Gmail API
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  try {
    const gmail = getGmailClient();

    // Create the email content
    const emailContent = [
      `From: The Piped Peony <${process.env.GMAIL_USER}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html,
    ].join('\n');

    // Encode the email in base64
    const encodedEmail = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send the email
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    console.log('✅ Email sent successfully to:', to);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    console.error('Error details:', error.message);
    return false;
  }
}

/**
 * Send a welcome email for free trial signups
 */
export async function sendWelcomeEmail(
  email: string,
  username: string,
  subscriptionName: string,
  trialDays: number
): Promise<boolean> {
  const subject = `Welcome to The Piped Peony`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to The Piped Peony</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 1px;">
                WELCOME TO THE PIPED PEONY
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                Thanks for creating an account on The Piped Peony. Your username is <strong>${username || email}</strong>.
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151;">
                You can access your account area to view orders, change your password, and more at:
              </p>
              
              <!-- Account Link Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://thepipedpeony.com'}/my-account" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Access My Account →
                    </a>
                  </td>
                </tr>
              </table>
              
              ${trialDays > 0 ? `
              <!-- Trial Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 6px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 10px; font-size: 18px; color: #1f2937;">
                      Your ${subscriptionName} Trial
                    </h2>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                      ✨ You have <strong>${trialDays} days</strong> of free access to explore all our courses and content.
                    </p>
                    <p style="margin: 10px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                      💳 You won't be charged until your trial ends. Cancel anytime!
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Facebook Community Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1877f2; border-radius: 6px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0 0 15px; font-size: 16px; color: #ffffff; font-weight: bold;">
                      Join our community of bakers on our Facebook page!
                    </p>
                    <a href="https://www.facebook.com/dpipedreams/" 
                       style="display: inline-block; background: #ffffff; color: #1877f2; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 15px;">
                      Join Our Facebook Community
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                Need help? Just reply to this email and we'll be happy to assist you!
              </p>
              
              <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Happy decorating! 🎂<br>
                <strong>The Piped Peony Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                The Piped Peony LLC
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://thepipedpeony.com'}/my-account" style="color: #667eea; text-decoration: none;">My Account</a> | 
                <a href="https://www.facebook.com/dpipedreams/" style="color: #1877f2; text-decoration: none;">Facebook</a> | 
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://thepipedpeony.com'}/contact" style="color: #667eea; text-decoration: none;">Contact Us</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send a receipt email for product purchases
 */
export async function sendPurchaseReceiptEmail(
  email: string,
  name: string,
  orderDetails: {
    orderId: string;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }
): Promise<boolean> {
  const subject = `Your Order Confirmation - The Piped Peony`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Order Confirmed! ✓
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                Hi ${name || 'there'},
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                Thank you for your purchase! Your order has been confirmed and will be processed shortly.
              </p>
              
              <!-- Order Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 6px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 10px; font-size: 18px; color: #1f2937;">
                      Order Details
                    </h2>
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                      Order ID: <strong>#${orderDetails.orderId}</strong>
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Items -->
              <h3 style="margin: 30px 0 15px; font-size: 18px; color: #1f2937;">
                Order Items
              </h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #e5e7eb;">
                ${orderDetails.items.map(item => `
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 14px; color: #374151;">
                      <strong>${item.name}</strong><br>
                      <span style="color: #6b7280;">Qty: ${item.quantity}</span>
                    </p>
                  </td>
                  <td align="right" style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 14px; color: #374151;">
                      $${item.price.toFixed(2)}
                    </p>
                  </td>
                </tr>
                `).join('')}
                
                <tr>
                  <td style="padding: 20px 0;">
                    <p style="margin: 0; font-size: 18px; color: #1f2937;">
                      <strong>Total</strong>
                    </p>
                  </td>
                  <td align="right" style="padding: 20px 0;">
                    <p style="margin: 0; font-size: 18px; color: #1f2937;">
                      <strong>$${orderDetails.total.toFixed(2)}</strong>
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                You'll receive a shipping confirmation email once your order is on its way.
              </p>
              
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                Questions about your order? Just reply to this email!
              </p>
              
              <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Thank you for shopping with us! 💜<br>
                <strong>The Piped Peony Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                The Piped Peony LLC
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thepipedpeony.com'}/my-account" style="color: #10b981; text-decoration: none;">View Orders</a> | 
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thepipedpeony.com'}/contact" style="color: #10b981; text-decoration: none;">Contact Us</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({ to: email, subject, html });
}


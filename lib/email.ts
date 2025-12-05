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
 * Send an email for subscription trial signups
 */
export async function sendSubscriptionTrialEmail(
  email: string,
  subscriptionName: string,
  trialDays: number
): Promise<boolean> {
  const subject = `Subscription Trial Activated`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Trial Activated</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'sofia-pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #f2ece7; padding: 40px 30px; text-align: center;">
              <img src="https://www.thepipedpeony.com/full-logo-1-1536x271.png" alt="The Piped Peony" style="max-width: 600px; height: auto; margin-bottom: 20px; display: inline-block;">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <p style="  text-align: center; margin: 0 0 20px; font-size: 20px; line-height: 1.6; color: #374151; font-family: 'sofia-pro', sans-serif;">
                Thank you for subscribing to The Piped Peony Academy!
              </p>
              
              <p style="margin: 0 0 30px; font-size: 14px; line-height: 1.6; color: #374151; font-family: 'sofia-pro', sans-serif;">
                You can access your account area to view orders, change your password, and more at:
              </p>
              
              <!-- Account Link Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://thepipedpeony.com'}/my-account" 
                       style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-weight: 600; font-size: 16px; font-family: 'sofia-pro', sans-serif;">
                      Access My Account
                    </a>
                  </td>
                </tr>
              </table>
              
              ${trialDays > 0 ? `
              <!-- Trial Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2ece7; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style=" text-align: center; margin: 0 0 12px; font-size: 20px; color: #000000; font-family: 'Playfair Display', Georgia, serif; font-weight: 700;">
                     ${subscriptionName} Trial
                    </h2>
                    <p style=" text-align: center; margin: 0; font-size: 14px; line-height: 1.6; color: #374151; font-family: 'sofia-pro', sans-serif;">
                      ✨ You have <strong>${trialDays} days</strong> of free access to explore all our courses and content.
                    </p>
                    <p style="margin: 10px 0 0; font-size: 14px; line-height: 1.6; color: #374151; font-family: 'sofia-pro', sans-serif;">
                      💳 You won't be charged until your trial ends. Cancel anytime!
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Facebook Community Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1877f2; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="margin: 0 0 15px; font-size: 16px; color: #ffffff; font-weight: 600; font-family: 'sofia-pro', sans-serif;">
                      Join our community of bakers on our Facebook page!
                    </p>
                    <a href="https://www.facebook.com/dpipedreams/" 
                       style="display: inline-block; background-color: #ffffff; color: #1877f2; text-decoration: none; padding: 12px 32px; border-radius: 50px; font-weight: 600; font-size: 15px; font-family: 'sofia-pro', sans-serif;">
                      Join Our Facebook Community
                    </a>
                  </td>
                </tr>
              </table>
              

              
              <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.6; color: #374151; font-family: 'sofia-pro', sans-serif;">
                Happy decorating!<br>
                <strong>The Piped Peony Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280; font-family: 'sofia-pro', sans-serif;">
                The Piped Peony LLC
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; font-family: 'sofia-pro', sans-serif;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://thepipedpeony.com'}/my-account" style="color: #000000; text-decoration: none;">My Account</a> | 
                <a href="https://www.facebook.com/dpipedreams/" style="color: #1877f2; text-decoration: none;">Facebook</a> | 
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://thepipedpeony.com'}/contact" style="color: #000000; text-decoration: none;">Contact Us</a>
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

  // Check if order contains ebook
  const hasEbook = orderDetails.items.some(item => {
    const itemName = item.name.toLowerCase();
    return itemName.includes('peony masterclass ebook') || 
           itemName.includes('masterclass ebook') || 
           itemName.includes('ebook');
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thepipedpeony.com';
  const downloadUrl = `${siteUrl}/api/download-ebook`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'sofia-pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #f2ece7; padding: 40px 30px; text-align: center;">
              <img src="https://www.thepipedpeony.com/full-logo-1-1536x271.png" alt="The Piped Peony" style="max-width: 600px; height: auto; margin-bottom: 20px; display: inline-block;">
              <h1 style="margin: 0; color: #000000; font-size: 28px; font-weight: 700; font-family: 'Playfair Display', Georgia, serif;">
                Order Confirmed! ✓
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151; font-family: 'sofia-pro', sans-serif;">
                Hi ${name || 'there'},
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151; font-family: 'sofia-pro', sans-serif;">
                Thank you for your purchase! Your order has been confirmed and will be processed shortly.
              </p>
              
              ${hasEbook ? `
              <!-- Ebook Download Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #D4A771; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <h2 style="margin: 0 0 15px; font-size: 22px; color: #ffffff; font-family: 'Playfair Display', Georgia, serif; font-weight: 700;">
                      📚 Your Digital Download is Ready!
                    </h2>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #ffffff; font-family: 'sofia-pro', sans-serif;">
                      Your ebook is available for immediate download. Click the button below to access your file.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${downloadUrl}" 
                             style="display: inline-block; background-color: #ffffff; color: #D4A771; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-weight: 600; font-size: 16px; font-family: 'sofia-pro', sans-serif;">
                            Download Your Ebook
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 20px 0 0; font-size: 12px; line-height: 1.6; color: #ffffff; font-family: 'sofia-pro', sans-serif; opacity: 0.9;">
                      You can also access your download anytime from your account page.
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Order Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2ece7; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 12px; font-size: 20px; color: #000000; font-family: 'Playfair Display', Georgia, serif; font-weight: 700;">
                      Order Details
                    </h2>
                    <p style="margin: 0; font-size: 14px; color: #374151; font-family: 'sofia-pro', sans-serif;">
                      Order ID: <strong>#${orderDetails.orderId}</strong>
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Items -->
              <h3 style="margin: 30px 0 15px; font-size: 20px; color: #000000; font-family: 'Playfair Display', Georgia, serif; font-weight: 700;">
                Order Items
              </h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #e5e7eb;">
                ${orderDetails.items.map(item => `
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 14px; color: #374151; font-family: 'sofia-pro', sans-serif;">
                      <strong>${item.name}</strong><br>
                      <span style="color: #6b7280;">Qty: ${item.quantity}</span>
                    </p>
                  </td>
                  <td align="right" style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 14px; color: #374151; font-family: 'sofia-pro', sans-serif;">
                      $${item.price.toFixed(2)}
                    </p>
                  </td>
                </tr>
                `).join('')}
                
                <tr>
                  <td style="padding: 20px 0;">
                    <p style="margin: 0; font-size: 18px; color: #000000; font-family: 'sofia-pro', sans-serif; font-weight: 600;">
                      <strong>Total</strong>
                    </p>
                  </td>
                  <td align="right" style="padding: 20px 0;">
                    <p style="margin: 0; font-size: 18px; color: #000000; font-family: 'sofia-pro', sans-serif; font-weight: 600;">
                      <strong>$${orderDetails.total.toFixed(2)}</strong>
                    </p>
                  </td>
                </tr>
              </table>
              
              ${!hasEbook ? `
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; font-family: 'sofia-pro', sans-serif;">
                You'll receive a shipping confirmation email once your order is on its way.
              </p>
              ` : ''}
              
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; font-family: 'sofia-pro', sans-serif;">
                Questions about your order? Just reply to this email!
              </p>
              
              <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.6; color: #374151; font-family: 'sofia-pro', sans-serif;">
                Thank you for shopping with us! 💜<br>
                <strong>The Piped Peony Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280; font-family: 'sofia-pro', sans-serif;">
                The Piped Peony LLC
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; font-family: 'sofia-pro', sans-serif;">
                <a href="${siteUrl}/my-account" style="color: #000000; text-decoration: none;">View Orders</a> | 
                <a href="${siteUrl}/contact" style="color: #000000; text-decoration: none;">Contact Us</a>
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


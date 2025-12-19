import nodemailer from 'nodemailer';

// Initialize Brevo SMTP transporter
const getEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.BREVO_SMTP_USER!, // Your Brevo email or login
      pass: process.env.BREVO_SMTP_KEY!,  // Your Brevo SMTP key
    },
  });
};

interface Attachment {
  filename: string;
  content: Buffer | string; // Base64 string or Buffer
  contentType?: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Attachment[];
}

/**
 * Send an email using Brevo SMTP with optional attachments
 */
export async function sendEmail({ to, subject, html, text, attachments }: SendEmailParams): Promise<boolean> {
  try {
    const transporter = getEmailTransporter();
    
    // Prepare email options
    const mailOptions: any = {
      from: {
        name: 'The Piped Peony',
        address: process.env.BREVO_FROM_EMAIL || process.env.BREVO_SMTP_USER!,
      },
      to: to,
      subject: subject,
      html: html,
      text: text,
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType || 'application/octet-stream',
      }));
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully to:', to);
    console.log('   📧 Message ID:', info.messageId);
    if (attachments && attachments.length > 0) {
      console.log(`   📎 With ${attachments.length} attachment(s)`);
    }
    return true;
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    console.error('Error details:', error.message);
    
    // Provide helpful error messages for common issues
    if (error.message?.includes('auth') || error.message?.includes('authentication')) {
      console.error('⚠️  SMTP authentication failed.');
      console.error('💡 Please check your Brevo SMTP credentials in .env.local');
      console.error('   - BREVO_SMTP_USER');
      console.error('   - BREVO_SMTP_KEY');
    }
    
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
 * Send a receipt email for product purchases with optional ebook attachments
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
  },
  ebookAttachments?: Attachment[]
): Promise<boolean> {
  const subject = `Your Order Confirmation - The Piped Peony`;

  // Check if order contains any ebooks
  const hasEbook = orderDetails.items.some(item => {
    const itemName = item.name.toLowerCase();
    return itemName.includes('the ultimate tip guide') || 
           itemName.includes('ultimate tip guide') ||
           itemName.includes('the caddy book set') ||
           itemName.includes('caddy book') ||
           itemName.includes('ebook');
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thepipedpeony.com';
  const downloadUrl = `${siteUrl}/my-account`;

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
                      Your ebook is ready! Click the button below to access your account and download your PDF.
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
                      Your download will be available in your account forever - access it anytime!
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
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

  return sendEmail({ 
    to: email, 
    subject, 
    html,
    attachments: ebookAttachments 
  });
}

/**
 * Send an invoice copy to the business owner
 */
export async function sendInvoiceCopyToOwner(
  invoiceData: {
    invoiceId: string;
    invoiceNumber: string | null;
    invoicePdfUrl: string;
    stripeDashboardUrl: string;
    customerName: string;
    customerEmail: string;
    paymentDate: string;
    items: Array<{
      description: string;
      quantity: number;
      amount: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    paymentType: 'subscription' | 'product_purchase';
  }
): Promise<boolean> {
  const ownerEmail = process.env.BUSINESS_OWNER_EMAIL;
  
  if (!ownerEmail) {
    console.warn('⚠️  BUSINESS_OWNER_EMAIL not configured - skipping owner notification');
    return false;
  }

  const subject = `New Payment Received - ${invoiceData.customerName || invoiceData.customerEmail}`;
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Payment Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                💰 New Payment Received
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                ${invoiceData.paymentType === 'subscription' ? 'Subscription Payment' : 'Shop Purchase'}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Customer Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding-bottom: 15px; border-bottom: 2px solid #e5e7eb;">
                    <h2 style="margin: 0; font-size: 18px; color: #111827; font-weight: 600;">
                      Customer Information
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #374151;">
                      <strong>Name:</strong> ${invoiceData.customerName || 'N/A'}
                    </p>
                    <p style="margin: 0 0 8px; font-size: 14px; color: #374151;">
                      <strong>Email:</strong> ${invoiceData.customerEmail}
                    </p>
                    <p style="margin: 0 0 8px; font-size: 14px; color: #374151;">
                      <strong>Date:</strong> ${invoiceData.paymentDate}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #374151;">
                      <strong>Invoice:</strong> ${invoiceData.invoiceNumber || invoiceData.invoiceId}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Order Items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding-bottom: 15px; border-bottom: 2px solid #e5e7eb;">
                    <h2 style="margin: 0; font-size: 18px; color: #111827; font-weight: 600;">
                      Order Details
                    </h2>
                  </td>
                </tr>
                ${invoiceData.items.map(item => `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 14px; color: #374151;">
                          ${item.description}
                        </td>
                        <td align="right" style="font-size: 14px; color: #6b7280;">
                          ×${item.quantity}
                        </td>
                        <td align="right" style="font-size: 14px; color: #111827; font-weight: 500; padding-left: 20px; white-space: nowrap;">
                          ${formatCurrency(item.amount, invoiceData.currency)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                `).join('')}
              </table>
              
              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="right" style="padding: 8px 0;">
                    <table cellpadding="0" cellspacing="0" style="margin-left: auto;">
                      <tr>
                        <td style="padding: 4px 20px 4px 0; font-size: 14px; color: #6b7280;">
                          Subtotal:
                        </td>
                        <td align="right" style="padding: 4px 0; font-size: 14px; color: #111827; white-space: nowrap;">
                          ${formatCurrency(invoiceData.subtotal, invoiceData.currency)}
                        </td>
                      </tr>
                      ${invoiceData.tax > 0 ? `
                      <tr>
                        <td style="padding: 4px 20px 4px 0; font-size: 14px; color: #6b7280;">
                          Tax:
                        </td>
                        <td align="right" style="padding: 4px 0; font-size: 14px; color: #111827; white-space: nowrap;">
                          ${formatCurrency(invoiceData.tax, invoiceData.currency)}
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 12px 20px 0 0; font-size: 16px; color: #111827; font-weight: 600; border-top: 2px solid #e5e7eb;">
                          Total:
                        </td>
                        <td align="right" style="padding: 12px 0 0; font-size: 16px; color: #10b981; font-weight: 700; border-top: 2px solid #e5e7eb; white-space: nowrap;">
                          ${formatCurrency(invoiceData.total, invoiceData.currency)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Action Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 10px;">
                          <a href="${invoiceData.invoicePdfUrl}" 
                             style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                            📄 View Invoice PDF
                          </a>
                        </td>
                        <td style="padding: 0 10px;">
                          <a href="${invoiceData.stripeDashboardUrl}" 
                             style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                            🔗 Open in Stripe
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                This is an automated notification from The Piped Peony payment system.
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

  console.log('📧 Sending invoice copy to business owner:', ownerEmail);
  const result = await sendEmail({ 
    to: ownerEmail, 
    subject, 
    html 
  });
  
  if (result) {
    console.log('✅ Invoice copy sent to business owner successfully');
  } else {
    console.error('❌ Failed to send invoice copy to business owner');
  }
  
  return result;
}


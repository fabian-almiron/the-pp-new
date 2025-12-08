import { NextRequest, NextResponse } from 'next/server';
import { sendSubscriptionTrialEmail, sendPurchaseReceiptEmail } from '@/lib/email';

// Direct PDF URL for ebooks
const EBOOK_PDF_URL = 'https://content.thepipedpeony.com/uploads/Ultimate_Tip_Guide_ce3a0f7f97.pdf';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailType = searchParams.get('type') || 'purchase'; // 'purchase' or 'subscription'
    const email = searchParams.get('email') || 'fabian.e.almiron@gmail.com';
    const withAttachment = searchParams.get('attachment') === 'true'; // Don't attach by default (file too large)
    const product = searchParams.get('product') || 'tip-guide'; // 'tip-guide', 'caddy', or 'both'
    const preview = searchParams.get('preview') === 'true'; // Just preview HTML without sending
    
    console.log('🧪 Testing email sending...');
    console.log('  - Type:', emailType);
    console.log('  - Email:', email);
    console.log('  - Product:', product);
    console.log('  - With PDF Attachment:', withAttachment);
    console.log('  - Preview Mode:', preview);
    
    if (emailType === 'purchase') {
      // Prepare test order items based on product selection
      let orderItems: Array<{name: string; quantity: number; price: number}> = [];
      let totalPrice = 0;
      
      if (product === 'tip-guide') {
        orderItems = [{
          name: 'The Ultimate Tip Guide',
          quantity: 1,
          price: 29.99,
        }];
        totalPrice = 29.99;
      } else if (product === 'caddy') {
        orderItems = [{
          name: 'The Caddy & Book Set',
          quantity: 1,
          price: 24.99,
        }];
        totalPrice = 24.99;
      } else if (product === 'both') {
        orderItems = [
          {
            name: 'The Ultimate Tip Guide',
            quantity: 1,
            price: 29.99,
          },
          {
            name: 'The Caddy & Book Set',
            quantity: 1,
            price: 24.99,
          }
        ];
        totalPrice = 54.98;
      }
      
      // Prepare ebook attachments if requested
      let ebookAttachments: Array<{filename: string; content: Buffer; contentType: string}> | undefined;
      
      if (withAttachment) {
        try {
          console.log('📥 Fetching PDF for attachment from:', EBOOK_PDF_URL);
          const pdfResponse = await fetch(EBOOK_PDF_URL);
          
          if (pdfResponse.ok) {
            const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
            
            // For 'both' products, only attach once (same file)
            ebookAttachments = [{
              filename: 'the-ultimate-tip-guide.pdf',
              content: pdfBuffer,
              contentType: 'application/pdf',
            }];
            console.log('✅ PDF fetched successfully, size:', pdfBuffer.length, 'bytes');
          } else {
            console.error('❌ Failed to fetch PDF:', pdfResponse.status);
          }
        } catch (error) {
          console.error('❌ Error fetching PDF:', error);
        }
      }
      
      // If preview mode, just return the HTML
      if (preview) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thepipedpeony.com';
        const downloadUrl = `${siteUrl}/my-account`;
        const hasEbook = true;
        
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
                Hi Test User,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151; font-family: 'sofia-pro', sans-serif;">
                Thank you for your purchase! Your order has been confirmed and will be processed shortly.
              </p>
              
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
        
        console.log('👁️ Preview mode - returning HTML');
        return new NextResponse(html, {
          headers: {
            'Content-Type': 'text/html',
          },
        });
      }
      
      // Send test purchase receipt email with ebook
      const emailSent = await sendPurchaseReceiptEmail(
        email,
        'Test User',
        {
          orderId: 'TEST1234',
          total: totalPrice,
          items: orderItems,
        },
        ebookAttachments
      );

      if (emailSent) {
        console.log('✅ Test purchase receipt email sent successfully!');
        return NextResponse.json({ 
          success: true, 
          message: `Test purchase receipt email sent successfully to ${email}`,
          emailType: 'purchase',
          includesDownloadLink: true,
          pdfAttached: withAttachment && ebookAttachments !== undefined,
          pdfSize: ebookAttachments ? ebookAttachments[0].content.length : 0
        });
      } else {
        console.error('❌ Failed to send test email');
        return NextResponse.json({ 
          success: false, 
          message: 'Failed to send test email' 
        }, { status: 500 });
      }
    } else {
      // Send test subscription email
      const emailSent = await sendSubscriptionTrialEmail(
        email,
        'The Piped Peony Academy',
        7 // 7 day trial
      );

      if (emailSent) {
        console.log('✅ Test subscription email sent successfully!');
        return NextResponse.json({ 
          success: true, 
          message: `Test subscription email sent successfully to ${email}`,
          emailType: 'subscription'
        });
      } else {
        console.error('❌ Failed to send test email');
        return NextResponse.json({ 
          success: false, 
          message: 'Failed to send test email' 
        }, { status: 500 });
      }
    }
  } catch (error: any) {
    console.error('❌ Error in test email endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Error sending test email',
      error: error.toString()
    }, { status: 500 });
  }
}


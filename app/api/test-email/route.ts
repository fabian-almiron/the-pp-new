import { NextRequest, NextResponse } from 'next/server';
import { sendSubscriptionTrialEmail, sendPurchaseReceiptEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailType = searchParams.get('type') || 'purchase'; // 'purchase' or 'subscription'
    const email = searchParams.get('email') || 'joshuastesch@gmail.com';
    
    console.log('🧪 Testing email sending...');
    console.log('  - Type:', emailType);
    console.log('  - Email:', email);
    
    if (emailType === 'purchase') {
      // Send test purchase receipt email with ebook download link
      const emailSent = await sendPurchaseReceiptEmail(
        email,
        'Test User',
        {
          orderId: 'TEST1234',
          total: 29.99,
          items: [
            {
              name: 'The Ultimate Tip Guide',
              quantity: 1,
              price: 29.99,
            }
          ],
        }
      );

      if (emailSent) {
        console.log('✅ Test purchase receipt email sent successfully!');
        return NextResponse.json({ 
          success: true, 
          message: `Test purchase receipt email sent successfully to ${email}`,
          emailType: 'purchase',
          includesDownloadLink: true
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


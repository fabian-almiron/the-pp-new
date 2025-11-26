import { NextRequest, NextResponse } from 'next/server';
import { sendSubscriptionTrialEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing email sending...');
    
    // Send test welcome email
    const emailSent = await sendSubscriptionTrialEmail(
      'joshuastesch@gmail.com',
      'The Piped Peony Academy',
      7 // 7 day trial
    );

    if (emailSent) {
      console.log('✅ Test email sent successfully!');
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully to joshuastesch@gmail.com' 
      });
    } else {
      console.error('❌ Failed to send test email');
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to send test email' 
      }, { status: 500 });
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


import { NextResponse } from 'next/server';

/**
 * Warmup endpoint to keep serverless functions warm
 * Called by Vercel Cron Job every 5 minutes to prevent cold starts
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  // Verify this is coming from Vercel Cron (optional security check)
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://the-pp-new.vercel.app';
  
  // Critical pages to keep warm
  const pagesToWarm = [
    '/',                     // Homepage
    '/blog',                 // Blog listing
    '/shop',                 // Shop page
    '/courses',              // Courses
    '/video-library',        // Video library
    '/category/the-blues',   // Example category
    '/level/beginner',       // Example level
    '/recipes',              // Recipe listing
  ];

  const results: { page: string; status: string; time: number }[] = [];

  // Ping each page
  for (const page of pagesToWarm) {
    const startTime = Date.now();
    try {
      const response = await fetch(`${baseUrl}${page}`, {
        method: 'HEAD', // Use HEAD to reduce bandwidth
        headers: {
          'User-Agent': 'Vercel-Cron-Warmup',
        },
      });
      
      const duration = Date.now() - startTime;
      results.push({
        page,
        status: response.ok ? 'success' : `error: ${response.status}`,
        time: duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      results.push({
        page,
        status: `error: ${error instanceof Error ? error.message : 'unknown'}`,
        time: duration,
      });
    }
  }

  const totalTime = results.reduce((sum, r) => sum + r.time, 0);
  const successCount = results.filter(r => r.status === 'success').length;

  console.log('🔥 Warmup complete:', {
    total: pagesToWarm.length,
    success: successCount,
    totalTime: `${totalTime}ms`,
    results,
  });

  return NextResponse.json({
    message: 'Warmup complete',
    timestamp: new Date().toISOString(),
    pages: results.length,
    success: successCount,
    totalTime: `${totalTime}ms`,
    results,
  });
}


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Railway environment detection
const isRailway = !!(process.env.RAILWAY_ENVIRONMENT || 
                   process.env.RAILWAY_PROJECT_ID || 
                   process.env.RAILWAY_SERVICE_NAME);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Railway-specific security headers
  if (isRailway) {
    // Add Railway environment info
    response.headers.set('X-Railway-Environment', process.env.RAILWAY_ENVIRONMENT || 'production');
    
    // Enhanced security headers for Railway production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      
      // HSTS for Railway HTTPS
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
  }

  // For API routes, add CORS headers with Railway optimization
  if (pathname.startsWith('/api/')) {
    // Railway-aware CORS configuration
    const allowedOrigins = isRailway 
      ? [
          process.env.RAILWAY_FRONTEND_URL,
          `https://${process.env.RAILWAY_PROJECT_ID}.up.railway.app`,
          'https://posyandu-management.up.railway.app'
        ].filter(Boolean)
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];

    const origin = request.headers.get('origin');
    
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin.includes('railway.app'))) {
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', isRailway ? '86400' : '3600');
    
    return response;
  }

  // Railway health check endpoint
  if (pathname === '/health' || pathname === '/api/health') {
    return NextResponse.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      railway: isRailway,
      version: process.env.npm_package_version || '1.0.0'
    });
  }

  // Let client-side AuthGuard and AuthContext handle authentication logic
  // since they have access to localStorage and can make API calls
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Middleware dejado sin restricciones para permitir el acceso directo a /admin
export async function proxy(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

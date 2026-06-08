import { NextResponse, type NextRequest } from 'next/server';

import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware';

const publicPaths = ['/login', '/admin-login'];
const memberPaths = ['/', '/today', '/history', '/announcements', '/soon'];

async function getRole(request: NextRequest, response: NextResponse) {
  const supabase = createSupabaseMiddlewareClient(request, response);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return { role: null as const, userId: null as const };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role,status,expire_date')
    .eq('id', data.user.id)
    .single();

  return {
    role: profile?.role ?? null,
    userId: data.user.id,
    status: profile?.status ?? null,
    expireDate: profile?.expire_date ?? null
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  if (publicPaths.includes(pathname)) {
    return response;
  }

  if (pathname.startsWith('/admin')) {
    const session = await getRole(request, response);

    if (!session.userId) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin-login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    if (session.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin-login';
      url.searchParams.set('reason', 'forbidden');
      return NextResponse.redirect(url);
    }

    return response;
  }

  if (memberPaths.includes(pathname)) {
    const session = await getRole(request, response);

    if (!session.userId) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    if (session.role !== 'member') {
      return response;
    }

    if (session.status !== 'active') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('reason', 'inactive');
      return NextResponse.redirect(url);
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/', '/today', '/history', '/announcements', '/soon', '/login', '/admin-login']
};

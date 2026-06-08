import { NextResponse } from 'next/server';

import { createSupabaseRouteClient } from '@/lib/supabase/route-client';

export async function POST(request: Request) {
  const cookieResponse = NextResponse.next();
  const requestCookies = new Map<string, string>();
  const supabase = createSupabaseRouteClient(
    request,
    cookieResponse,
    (name) => requestCookies.get(name),
    (name, value) => {
      requestCookies.set(name, value);
      cookieResponse.cookies.set(name, value);
    },
    (name) => {
      requestCookies.delete(name);
      cookieResponse.cookies.set(name, '', { maxAge: 0 });
    }
  );

  await supabase.auth.signOut();

  const response = NextResponse.json({ ok: true });

  for (const cookie of cookieResponse.cookies.getAll()) {
    response.cookies.set(cookie);
  }

  return response;
}

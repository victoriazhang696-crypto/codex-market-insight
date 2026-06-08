import { NextResponse } from 'next/server';

import { createSupabaseRouteClient } from '@/lib/supabase/route-client';

type AdminLoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as AdminLoginBody;
  const email = body.email?.trim() ?? '';
  const password = body.password?.trim() ?? '';
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

  if (!email || !password) {
    return NextResponse.json({ ok: false, message: 'Email and password are required.' }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut();
    return NextResponse.json({ ok: false, message: 'Not an admin account.' }, { status: 403 });
  }

  const response = NextResponse.json({
    ok: true,
    user: {
      id: data.user.id,
      email: data.user.email
    }
  });

  for (const cookie of cookieResponse.cookies.getAll()) {
    response.cookies.set(cookie);
  }

  return response;
}

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextResponse } from 'next/server';

type CookieSet = (name: string, value: string, options?: CookieOptions) => void;
type CookieRemove = (name: string, options?: CookieOptions) => void;

export function createSupabaseRouteClient(
  request: Request,
  response: NextResponse,
  getCookie: (name: string) => string | undefined,
  setCookie: CookieSet,
  removeCookie: CookieRemove
) {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error('Missing Supabase publishable key.');
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      cookies: {
        get(name) {
          return getCookie(name);
        },
        set(name, value, options) {
          setCookie(name, value, options);
        },
        remove(name, options) {
          removeCookie(name, options);
        }
      }
    }
  );
}

import { NextResponse } from 'next/server';

export function getRequestCookieMap(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const entries = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf('=');
      if (separator === -1) {
        return [part, ''] as const;
      }

      return [part.slice(0, separator), part.slice(separator + 1)] as const;
    });

  return new Map<string, string>(entries);
}

export function jsonWithRouteCookies(body: unknown, cookieResponse: NextResponse, init?: ResponseInit) {
  const response = NextResponse.json(body, init);

  for (const cookie of cookieResponse.cookies.getAll()) {
    response.cookies.set(cookie);
  }

  return response;
}

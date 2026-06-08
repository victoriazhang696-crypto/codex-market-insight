# Market Insights Center Next.js Starter

This is the starting codebase for the real app version.

## What It Covers

- Member login page
- Member home page
- Admin dashboard page
- Supabase client/server helpers
- Middleware placeholder for route protection
- The account model you requested:
  - 8-digit member account number
  - mobile number as the initial member password
  - separate admin credentials

## Login Model

The member-visible login form should ask for:

- account number
- password

The password is the member's mobile number.

Because Supabase Auth uses email/password under the hood, the backend maps each account number to a generated email like:

`10002888@members.local`

## Folder Layout

- `app/page.tsx`: member home
- `app/login/page.tsx`: member login
- `app/admin-login/page.tsx`: staff login
- `app/logout/page.tsx`: logout redirect helper
- `app/today/page.tsx`: today's insight view
- `app/today/[slug]/page.tsx`: today's insight detail
- `app/history/page.tsx`: archive view
- `app/announcements/page.tsx`: announcements view
- `app/soon/page.tsx`: future modules preview
- `app/admin/page.tsx`: staff dashboard
- `app/admin/members/page.tsx`: customer management
- `app/admin/articles/page.tsx`: article publishing
- `app/admin/articles/[slug]/page.tsx`: article editor/detail
- `app/admin/analytics/page.tsx`: analytics panel
- `lib/supabase/client.ts`: browser Supabase client
- `lib/supabase/server.ts`: server Supabase helpers
- `lib/supabase/admin.ts`: service-role admin client
- `lib/supabase/middleware.ts`: auth-aware middleware helper
- `middleware.ts`: route guard placeholder
- `app/api/auth/member-login/route.ts`: member login endpoint
- `app/api/auth/admin-login/route.ts`: admin login endpoint
- `app/api/auth/logout/route.ts`: logout endpoint
- `app/api/admin/members/route.ts`: create member endpoint
- `app/api/admin/articles/route.ts`: create article endpoint

## What To Do Next

1. Install dependencies.
2. Connect the Supabase project.
3. Replace the placeholder login logic with real auth.
4. Wire the admin member creation form to `profiles` and Supabase Auth.
5. Use the SQL in `../supabase-schema.sql` to create the backend tables and RLS policies.
6. Connect article publish flows so admin posts surface on the client home and insight pages.
7. Add middleware and server-side redirects so `/admin` and member pages are actually protected.
8. Wire the admin routes to the Supabase service-role client only on the server.

## API Payloads

### `POST /api/auth/member-login`

```json
{
  "accountNumber": "10002888",
  "password": "60123456789"
}
```

### `POST /api/admin/members`

```json
{
  "accountNumber": "10002888",
  "fullName": "张先生",
  "phone": "60123456789",
  "expireDate": "2026-12-31"
}
```

### `POST /api/admin/articles`

```json
{
  "title": "今日市场洞察：黄金与美元",
  "content": "正文内容",
  "summary": "摘要",
  "riskNotice": "风险提示",
  "status": "published"
}
```

## Current UI Behavior

- The member login page submits to the login API endpoint.
- The admin customer form submits to the member creation API endpoint.
- The admin article form submits to the article creation API endpoint.
- The pages still need a real Supabase project and environment variables to fully operate.
- The route guard now redirects unauthenticated users away from protected pages and separates admin/member access.
- Login now redirects to the `next` path after a successful auth response.
- The logout page calls the logout API and returns the user to `/login`.
- The admin login page sends staff into `/admin`, while member login stays on the customer side.

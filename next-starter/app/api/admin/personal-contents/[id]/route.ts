import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type Params = {
  params: Promise<{ id: string }>;
};

type PersonalContentUpdateBody = {
  status?: 'draft' | 'published' | 'hidden';
};

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as PersonalContentUpdateBody;

  if (!body.status) {
    return NextResponse.json({ ok: false, message: '缺少状态。' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('personal_contents')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, title, status')
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, content: data });
}

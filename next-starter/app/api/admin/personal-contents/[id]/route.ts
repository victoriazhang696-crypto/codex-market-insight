import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type Params = {
  params: Promise<{ id: string }>;
};

type PersonalContentUpdateBody = {
  targetUserId?: string;
  title?: string;
  body?: string;
  contentType?: string;
  attachmentUrl?: string;
  status?: 'draft' | 'published' | 'hidden';
};

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as PersonalContentUpdateBody;

  const updates: Record<string, string | null> = {};

  if (body.targetUserId !== undefined) updates.target_user_id = body.targetUserId.trim();
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.body !== undefined) updates.body = body.body.trim();
  if (body.contentType !== undefined) updates.content_type = body.contentType.trim() || '定制内容';
  if (body.attachmentUrl !== undefined) updates.attachment_url = body.attachmentUrl.trim() || null;
  if (body.status !== undefined) updates.status = body.status;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, message: '没有需要更新的内容。' }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('personal_contents')
    .update(updates)
    .eq('id', id)
    .select('id, title, status')
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, content: data });
}

import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const bucketName = 'admin-uploads';
const allowedTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

function getExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName) return fromName.replace(/[^a-z0-9]/g, '');
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type.startsWith('image/')) return file.type.replace('image/', '');
  return 'bin';
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const folder = String(formData.get('folder') ?? 'content').replace(/[^a-z0-9-]/gi, '-').toLowerCase();

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: '请选择要上传的文件。' }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ ok: false, message: '仅支持 PDF、JPG、PNG、WebP 或 GIF。' }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ ok: false, message: '文件不能超过 8MB。' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  await supabase.storage.createBucket(bucketName, { public: true }).catch(() => undefined);

  const extension = getExtension(file);
  const path = `${folder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, {
      contentType: file.type,
      upsert: false
    });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);

  return NextResponse.json({
    ok: true,
    url: data.publicUrl,
    fileType: file.type,
    name: file.name
  });
}

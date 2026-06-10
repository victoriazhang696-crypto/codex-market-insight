import { type FeaturePermission } from '@/lib/feature-permissions';
import { canCurrentMemberAccess, getCurrentMemberProfile } from '@/lib/member-profile';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type PersonalContent = {
  id: string;
  serviceKey: FeaturePermission;
  targetUserId: string;
  title: string;
  body: string;
  contentType: string;
  attachmentUrl: string | null;
  status: 'draft' | 'published' | 'hidden';
  createdAt?: string;
  updatedAt?: string;
};

function mapPersonalContent(row: Record<string, unknown>): PersonalContent {
  return {
    id: String(row.id ?? ''),
    serviceKey: String(row.service_key ?? 'driving_school') as FeaturePermission,
    targetUserId: String(row.target_user_id ?? ''),
    title: String(row.title ?? ''),
    body: String(row.body ?? ''),
    contentType: String(row.content_type ?? '定制内容'),
    attachmentUrl: row.attachment_url ? String(row.attachment_url) : null,
    status: row.status === 'draft' || row.status === 'hidden' ? row.status : 'published',
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined
  };
}

export async function getCurrentMemberPersonalContents(serviceKey: FeaturePermission) {
  const [profile, canAccess] = await Promise.all([
    getCurrentMemberProfile(),
    canCurrentMemberAccess(serviceKey)
  ]);

  if (!profile || !canAccess) {
    return [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('personal_contents')
      .select('id, service_key, target_user_id, title, body, content_type, attachment_url, status, created_at, updated_at')
      .eq('service_key', serviceKey)
      .eq('target_user_id', profile.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error || !data?.length) {
      return [];
    }

    return data.map((row) => mapPersonalContent(row));
  } catch {
    return [];
  }
}

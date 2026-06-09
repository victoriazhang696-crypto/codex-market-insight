import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasFeaturePermission, normalizeFeaturePermissions, type FeaturePermission } from '@/lib/feature-permissions';

export type MemberProfile = {
  accountNumber: string;
  fullName: string;
  expireDate: string | null;
  status: string;
  featurePermissions: FeaturePermission[];
  remainingDays: number | null;
};

function getRemainingDays(expireDate: string | null) {
  if (!expireDate) {
    return null;
  }

  const today = new Date();
  const end = new Date(`${expireDate}T00:00:00`);
  today.setHours(0, 0, 0, 0);

  return Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
}

export async function getCurrentMemberProfile(): Promise<MemberProfile | null> {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return null;
  }

  const { data } = await supabase
    .from('profiles')
    .select('account_number, full_name, expire_date, status, feature_permissions')
    .eq('id', authData.user.id)
    .single();

  if (!data) {
    const fallbackResult = await supabase
      .from('profiles')
      .select('account_number, full_name, expire_date, status')
      .eq('id', authData.user.id)
      .single();

    if (!fallbackResult.data) {
      return null;
    }

    return {
      accountNumber: fallbackResult.data.account_number ?? '',
      fullName: fallbackResult.data.full_name ?? '会员',
      expireDate: fallbackResult.data.expire_date ?? null,
      status: fallbackResult.data.status ?? 'active',
      featurePermissions: normalizeFeaturePermissions(null),
      remainingDays: getRemainingDays(fallbackResult.data.expire_date ?? null)
    };
  }

  return {
    accountNumber: data.account_number ?? '',
    fullName: data.full_name ?? '会员',
    expireDate: data.expire_date ?? null,
    status: data.status ?? 'active',
    featurePermissions: normalizeFeaturePermissions(data.feature_permissions),
    remainingDays: getRemainingDays(data.expire_date ?? null)
  };
}

export async function canCurrentMemberAccess(feature: FeaturePermission) {
  const profile = await getCurrentMemberProfile();

  if (!profile) {
    return false;
  }

  return hasFeaturePermission(profile.featurePermissions, feature);
}

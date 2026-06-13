import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  getRemainingDaysFromMalaysiaToday,
  hasActiveFeaturePermission,
  normalizeFeatureExpiries,
  normalizeFeaturePermissions,
  type FeatureExpiries,
  type FeaturePermission
} from '@/lib/feature-permissions';

export type MemberProfile = {
  id: string;
  accountNumber: string;
  fullName: string;
  expireDate: string | null;
  status: string;
  featurePermissions: FeaturePermission[];
  featureExpiries: FeatureExpiries;
  remainingDays: number | null;
  computeCredits: number;
};

function normalizeComputeCredits(value: unknown) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
}

export async function getCurrentMemberProfile(): Promise<MemberProfile | null> {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return null;
  }

  const { data } = await supabase
    .from('profiles')
    .select('account_number, full_name, expire_date, status, role, feature_permissions, feature_expiries, compute_credits')
    .eq('id', authData.user.id)
    .single();

  if (!data) {
    const fallbackResult = await supabase
      .from('profiles')
      .select('account_number, full_name, expire_date, status, role')
      .eq('id', authData.user.id)
      .single();

    if (!fallbackResult.data || fallbackResult.data.role !== 'member') {
      return null;
    }

    return {
      id: authData.user.id,
      accountNumber: fallbackResult.data.account_number ?? '',
      fullName: fallbackResult.data.full_name ?? '会员',
      expireDate: fallbackResult.data.expire_date ?? null,
      status: fallbackResult.data.status ?? 'active',
      featurePermissions: normalizeFeaturePermissions(null),
      featureExpiries: {},
      remainingDays: getRemainingDaysFromMalaysiaToday(fallbackResult.data.expire_date ?? null),
      computeCredits: 0
    };
  }

  if (data.role !== 'member') {
    return null;
  }

  return {
    id: authData.user.id,
    accountNumber: data.account_number ?? '',
    fullName: data.full_name ?? '会员',
    expireDate: data.expire_date ?? null,
    status: data.status ?? 'active',
    featurePermissions: normalizeFeaturePermissions(data.feature_permissions),
    featureExpiries: normalizeFeatureExpiries(data.feature_expiries),
    remainingDays: getRemainingDaysFromMalaysiaToday(data.expire_date ?? null),
    computeCredits: normalizeComputeCredits(data.compute_credits)
  };
}

export async function canCurrentMemberAccess(feature: FeaturePermission) {
  const profile = await getCurrentMemberProfile();

  if (!profile) {
    return false;
  }

  if (profile.status !== 'active') {
    return false;
  }

  return hasActiveFeaturePermission(profile.featurePermissions, profile.featureExpiries, feature);
}

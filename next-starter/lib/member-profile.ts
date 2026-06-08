import { createSupabaseServerClient } from '@/lib/supabase/server';

export type MemberProfile = {
  accountNumber: string;
  fullName: string;
  expireDate: string | null;
  status: string;
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
    .select('account_number, full_name, expire_date, status')
    .eq('id', authData.user.id)
    .single();

  if (!data) {
    return null;
  }

  return {
    accountNumber: data.account_number ?? '',
    fullName: data.full_name ?? '会员',
    expireDate: data.expire_date ?? null,
    status: data.status ?? 'active',
    remainingDays: getRemainingDays(data.expire_date ?? null)
  };
}

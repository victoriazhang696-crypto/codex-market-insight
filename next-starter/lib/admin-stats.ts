import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type Metric = {
  label: string;
  value: string;
};

function formatCount(count: number | null) {
  return String(count ?? 0);
}

export async function getAdminDashboardMetrics(): Promise<Metric[]> {
  const supabase = createSupabaseAdminClient();
  const today = new Date();
  const todayDate = today.toISOString().slice(0, 10);
  const todayStart = `${todayDate}T00:00:00.000Z`;

  const [totalMembers, activeMembers, todayViews, todayLogins] = await Promise.all([
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'member'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'member')
      .eq('status', 'active')
      .or(`expire_date.is.null,expire_date.gte.${todayDate}`),
    supabase
      .from('article_views')
      .select('id', { count: 'exact', head: true })
      .gte('view_time', todayStart),
    supabase
      .from('login_logs')
      .select('id', { count: 'exact', head: true })
      .gte('login_time', todayStart)
  ]);

  return [
    { label: '总会员数', value: formatCount(totalMembers.count) },
    { label: '有效会员', value: formatCount(activeMembers.count) },
    { label: '今日阅读', value: formatCount(todayViews.count) },
    { label: '今日登录', value: formatCount(todayLogins.count) }
  ];
}

export async function getAdminAnalyticsMetrics(): Promise<Metric[]> {
  const supabase = createSupabaseAdminClient();
  const today = new Date();
  const todayDate = today.toISOString().slice(0, 10);
  const todayStart = `${todayDate}T00:00:00.000Z`;

  const [totalMembers, activeMembers, expiredMembers, todayLogins] = await Promise.all([
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'member'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'member')
      .eq('status', 'active')
      .or(`expire_date.is.null,expire_date.gte.${todayDate}`),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'member')
      .or(`status.eq.expired,expire_date.lt.${todayDate}`),
    supabase
      .from('login_logs')
      .select('id', { count: 'exact', head: true })
      .gte('login_time', todayStart)
  ]);

  return [
    { label: '总会员数', value: formatCount(totalMembers.count) },
    { label: '有效会员', value: formatCount(activeMembers.count) },
    { label: '到期会员', value: formatCount(expiredMembers.count) },
    { label: '今日登录', value: formatCount(todayLogins.count) }
  ];
}

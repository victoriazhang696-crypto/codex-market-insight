import { articleCategories, type ArticleCategory } from '@/lib/article-categories';

export type FeaturePermission = ArticleCategory;
export type FeatureExpiries = Partial<Record<FeaturePermission, string>>;

export const defaultMemberPermissions: FeaturePermission[] = ['market_today', 'market_history', 'member_notice'];

export const featurePermissions = articleCategories.map((item) => ({
  value: item.value,
  label: item.label,
  description: item.description
}));

export function normalizeFeaturePermissions(value: unknown): FeaturePermission[] {
  if (!Array.isArray(value)) {
    return defaultMemberPermissions;
  }

  const allowed = new Set(featurePermissions.map((item) => item.value));
  const normalized = value.filter((item): item is FeaturePermission => typeof item === 'string' && allowed.has(item as FeaturePermission));

  return normalized.length > 0 ? normalized : defaultMemberPermissions;
}

export function hasFeaturePermission(permissions: FeaturePermission[] | null | undefined, feature: FeaturePermission) {
  const normalized = permissions?.length ? permissions : defaultMemberPermissions;
  return normalized.includes(feature);
}

export function normalizeFeatureExpiries(value: unknown): FeatureExpiries {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const allowed = new Set(featurePermissions.map((item) => item.value));
  const entries = Object.entries(value as Record<string, unknown>).filter(
    (entry): entry is [FeaturePermission, string] =>
      allowed.has(entry[0] as FeaturePermission) && typeof entry[1] === 'string' && entry[1].trim().length > 0
  );

  return Object.fromEntries(entries);
}

function dateToUtcDay(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

export function getMalaysiaTodayString() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === 'year')?.value ?? '1970';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';

  return `${year}-${month}-${day}`;
}

export function getRemainingDaysFromMalaysiaToday(expireDate: string | null | undefined) {
  if (!expireDate) {
    return null;
  }

  return Math.ceil((dateToUtcDay(expireDate) - dateToUtcDay(getMalaysiaTodayString())) / 86_400_000);
}

export function isDateActive(expireDate: string | null | undefined) {
  if (!expireDate) {
    return true;
  }

  return getMalaysiaTodayString() <= expireDate;
}

export function getFeatureExpireDate(featureExpiries: FeatureExpiries | null | undefined, feature: FeaturePermission, fallbackDate?: string | null) {
  return featureExpiries?.[feature] || fallbackDate || null;
}

export function hasActiveFeaturePermission(
  permissions: FeaturePermission[] | null | undefined,
  featureExpiries: FeatureExpiries | null | undefined,
  feature: FeaturePermission,
  fallbackExpireDate?: string | null
) {
  if (!hasFeaturePermission(permissions, feature)) {
    return false;
  }

  return isDateActive(getFeatureExpireDate(featureExpiries, feature, fallbackExpireDate));
}

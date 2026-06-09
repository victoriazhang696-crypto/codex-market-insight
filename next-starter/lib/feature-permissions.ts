import { articleCategories, type ArticleCategory } from '@/lib/article-categories';

export type FeaturePermission = ArticleCategory;

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

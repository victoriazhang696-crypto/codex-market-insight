export type ArticleCategory = 'market_today' | 'paipao_special' | 'us_review' | 'member_notice' | 'ai_service';

export const articleCategories: Array<{ value: ArticleCategory; label: string; description: string }> = [
  {
    value: 'market_today',
    label: '今日洞察',
    description: '发布到会员前端的今日市场洞察，并进入历史洞察。'
  },
  {
    value: 'paipao_special',
    label: '陪跑专项',
    description: '发布专项陪跑内容，后续可独立成服务页。'
  },
  {
    value: 'us_review',
    label: 'US复盘简报',
    description: '发布美股或 US 市场复盘类文章。'
  },
  {
    value: 'member_notice',
    label: '公告通知',
    description: '发布会员通知、直播安排和服务更新。'
  },
  {
    value: 'ai_service',
    label: '待解锁AI服务',
    description: '预留给后续深度并入的 AI 工具或专项功能。'
  }
];

export function getArticleCategoryLabel(category: ArticleCategory) {
  return articleCategories.find((item) => item.value === category)?.label ?? '今日洞察';
}

export function isArticleCategory(value: unknown): value is ArticleCategory {
  return typeof value === 'string' && articleCategories.some((item) => item.value === value);
}

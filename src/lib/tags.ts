// 角标标签：一个标签同时具备「置顶」与「底部角标」两种功能。
// 角标名称完全由 Notion 库 promo 单选字段决定，代码不再写死名字（改名字只在 Notion 操作）。
// promo 字段中任何不在 HIDDEN_TAGS 里的非空值都视为角标，颜色按下方调色板顺序自动分配。

// 角标调色板：promo 字段各选项按顺序对应一种颜色（改色只改这里，名称以 Notion 为准）
export const BADGE_COLORS = ['#FF6B6B', '#4ECDC4', '#FFB347', '#A29BFE', '#5B8DEF'];

// 特殊标签：仅用于代码识别广告位，不应作为普通标签展示给用户
export const TAG_AD_TAG = '标签广告';

// 底部推荐栏标签：在主内容区「最近更新」下方展示独立推荐链接，与标签广告无关
export const BOTTOM_RECOMMEND_TAG = '底部推荐';

// 普通卡片上需要隐藏的特殊标签（给代码看、不给用户看）
// 注意：这些标签现在存放在 system 单选字段，不再混在 tags 中
export const HIDDEN_TAGS = [TAG_AD_TAG, BOTTOM_RECOMMEND_TAG];

// 置顶推广位最多展示数量
export const MAX_PROMOTED = 5;

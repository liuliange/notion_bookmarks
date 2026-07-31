// 角标标签：一个标签同时具备「置顶」与「底部角标」两种功能。
// 名称必须与网站配置 WIDGET_BADGE_CONFIG 中的标签名完全一致。
export const BADGE_TAGS = ['领优惠券', '好物精选', '人气优选', '口碑推荐', '编辑推荐'];

// 特殊标签：仅用于代码识别广告位，不应作为普通标签展示给用户
export const TAG_AD_TAG = '标签广告';

// 底部推荐栏标签：在主内容区「最近更新」下方展示独立推荐链接，与标签广告无关
export const BOTTOM_RECOMMEND_TAG = '底部推荐';

// 普通卡片上需要隐藏的特殊标签（给代码看、不给用户看）
export const HIDDEN_TAGS = [TAG_AD_TAG];

// 置顶推广位最多展示数量
export const MAX_PROMOTED = 5;

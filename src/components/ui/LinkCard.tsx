'use client';

import { Link } from '@/types';
import { motion } from 'framer-motion';
import { Copy, Share2, ExternalLink } from 'lucide-react';
import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import {
  FALLBACK_ICON_SRC,
  ICON_LOAD_TIMEOUT_MS,
  getFailedIconState,
  getInitialIconState,
  getLoadedIconState,
  getTimedOutIconState,
} from '@/lib/link-icon';
import { HIDDEN_TAGS, BADGE_COLORS } from '@/lib/tags';
import { useTheme } from 'next-themes';

// 角标名称 → 颜色 的稳定映射：按角标名首次出现顺序从 BADGE_COLORS 轮转分配，
// 保证同一次运行内同名角标颜色固定，且不依赖任何外部配置。
const badgeColorCache = new Map<string, string>();
function getBadgeColor(name: string): string {
  if (!badgeColorCache.has(name)) {
    const idx = badgeColorCache.size % BADGE_COLORS.length;
    badgeColorCache.set(name, BADGE_COLORS[idx]);
  }
  return badgeColorCache.get(name)!;
}

interface LinkCardProps {
  link: Link;
  className?: string;
  // 仅推广位（置顶卡片）显示 promo 角标；普通列表传 false/不传，隐藏 promo 角标
  showPromoBadge?: boolean;
}

// 提示框组件 - 完整显示被折叠的标题/描述。
// 设计原则：
//   1. 宽度固定 = 被点击卡片的列宽，绝不横跨两列、不穿透邻卡
//   2. 内容在列宽内自动换行，多行完整显示
//   3. 永远显示在卡片正上方（间距 4px）；上方空间不足时贴视口顶部，绝不往下弹
//   4. 宽度自适应内容（fit-content）：短标题紧凑不空，长内容在列宽内自动换行，左右列一致
function Tooltip({ content, show, cardRect }: { content: string; show: boolean; cardRect: DOMRect | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [adjustedStyle, setAdjustedStyle] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    if (!show || !cardRect) {
      setAdjustedStyle(null);
      return;
    }
    const raf = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const tooltipRect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const gap = 8;

      // 水平：严格对齐卡片左边缘，做视口边界裁剪
      let left = cardRect.left;
      const tooltipW = tooltipRect.width;
      if (left + tooltipW > vw - gap) {
        left = Math.max(gap, vw - tooltipW - gap);
      }
      if (left < gap) left = gap;

      // 垂直：始终显示在卡片正上方
      let top = cardRect.top - tooltipRect.height - 4;
      if (top < gap) top = gap;

      setAdjustedStyle({ left, top });
    });
    return () => cancelAnimationFrame(raf);
  }, [show, cardRect, content]);

  if (!show) return null;
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  const finalLeft = adjustedStyle?.left ?? (cardRect?.left ?? 0);
  const finalTop = adjustedStyle?.top ?? (cardRect?.top ?? 0);

  return createPortal(
    <div
      ref={ref}
      className="fixed p-2 rounded-lg bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/85
                border border-white/20 shadow-lg z-[100] pointer-events-none
                animate-in fade-in zoom-in-95 duration-200 tooltip-popup"
      style={{
        left: finalLeft,
        top: finalTop,
        width: 'fit-content',
        maxWidth: cardRect ? `${cardRect.width}px` : 'calc(100vw - 16px)',
        visibility: adjustedStyle ? 'visible' : 'hidden',
      }}
    >
      <p className="text-sm text-popover-foreground break-words leading-snug">{content}</p>
    </div>,
    document.body
  );
}

// 轻量 Toast 提示 - 复用 Tooltip 的 portal 模式，屏幕底部居中，自动消失
function Toast({ msg, show }: { msg: string; show: boolean }) {
  if (!show) return null;

  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed left-0 right-0 mx-auto w-fit max-w-[90vw] bottom-6 z-[100] pointer-events-none
                px-4 py-2 rounded-lg bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/85
                border border-white/20 shadow-lg text-sm text-popover-foreground
                animate-in fade-in zoom-in-95 duration-200"
    >
      {msg}
    </div>,
    document.body
  );
}

// Notion 颜色映射 - 与 Notionav 保持一致
// key 对应 Notion select 选项的“名称”（中文），并额外兼容 Notion 内部英文颜色值作为别名
const COLOR_MAP: { [key: string]: { bg: string; text: 'white' | 'black' } } = {
  // 中文（与 Notion select 选项名称一致）
  '红色': { bg: '#ef6064', text: 'white' },
  '橙色': { bg: '#fb7d5e', text: 'white' },
  '橙黄': { bg: '#f39f4a', text: 'white' },
  '黄色': { bg: '#e5bf01', text: 'white' },
  '绿色': { bg: '#32c050', text: 'white' },
  '青色': { bg: '#08c4a5', text: 'white' },
  '浅蓝': { bg: '#64c2ea', text: 'white' },
  '蓝色': { bg: '#328eff', text: 'white' },
  '紫色': { bg: '#4b67c3', text: 'white' },
  '深紫': { bg: '#7f4eb4', text: 'white' },
  '淡紫': { bg: '#af70d9', text: 'white' },
  '粉色': { bg: '#eb7ac7', text: 'white' },
  '灰色': { bg: '#7e8793', text: 'white' },
  '驼色': { bg: '#b99e80', text: 'white' },
  '米色': { bg: '#b89e80', text: 'white' },
  // 英文别名（Notion 内部颜色值）
  'gray': { bg: '#7e8793', text: 'white' },
  'brown': { bg: '#b99e80', text: 'white' },
  'orange': { bg: '#fb7d5e', text: 'white' },
  'yellow': { bg: '#e5bf01', text: 'white' },
  'green': { bg: '#32c050', text: 'white' },
  'blue': { bg: '#328eff', text: 'white' },
  'purple': { bg: '#7f4eb4', text: 'white' },
  'pink': { bg: '#eb7ac7', text: 'white' },
  'red': { bg: '#ef6064', text: 'white' },
};

function getCardColorData(color?: string) {
  const colorConfig = color ? COLOR_MAP[color] : null;
  if (!colorConfig) {
    return { bg: '', textColor: '', applyColor: false };
  }
  return {
    bg: colorConfig.bg,
    textColor: colorConfig.text === 'white' ? '#ffffff' : '#1a1a1a',
    applyColor: true,
  };
}

// 分离 Image 组件以避免整个 LinkCard 重渲染
const OptimisedLinkIcon = memo(function OptimisedLinkIcon({ 
  src, 
  alt, 
  onLoad, 
  onError 
}: { 
  src: string; 
  alt: string; 
  onLoad?: () => void; 
  onError: () => void;
}) {
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const image = imageRef.current;
        if (!image) return;

        const reportImageStatus = () => {
            if (!image.complete) return false;

            if (image.naturalWidth > 0) {
                onLoad?.();
            } else {
                onError();
            }

            return true;
        };

        if (reportImageStatus()) return;

        let attempts = 0;
        const intervalId = window.setInterval(() => {
            attempts += 1;
            if (reportImageStatus() || attempts >= 30) {
                window.clearInterval(intervalId);
            }
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [src, onLoad, onError]);

    return (
        // 这里刻意使用原生 img，避免 Vercel Image Optimization 免费额度消耗。
        // eslint-disable-next-line @next/next/no-img-element
        <img
            ref={imageRef}
            src={src}
            alt={alt}
            className={cn(
                "w-full h-full object-contain transition-opacity duration-200"
            )}
            onLoad={onLoad}
            onError={onError}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
        />
    );
}, (prev, next) => prev.src === next.src && prev.alt === next.alt);


const LinkCard = memo(function LinkCard({ link, className, showPromoBadge = false }: LinkCardProps) {
  const [mounted, setMounted] = useState(false);
  const [titleTooltip, setTitleTooltip] = useState<{ show: boolean; rect: DOMRect | null }>({ show: false, rect: null });
  const [descTooltip, setDescTooltip] = useState<{ show: boolean; rect: DOMRect | null }>({ show: false, rect: null });
  const [iconState, setIconState] = useState(() => getInitialIconState(link));
  const iconContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState({ show: false, msg: '' });
  const toastTimer = useRef<number | undefined>(undefined);
  // 触屏设备点击被折叠标题/描述时，提示框显示在卡片上方（而非屏幕底部）
  const [touchTooltip, setTouchTooltip] = useState<{ show: boolean; rect: DOMRect | null; content: string }>({ show: false, rect: null, content: '' });
  const touchTimer = useRef<number | undefined>(undefined);
  const { theme } = useTheme();

  // 🆕 客户端挂载后再应用卡片配色，避免 hydration 不一致
  useEffect(() => {
    setMounted(true);
  }, []);

    // 使用 useCallback 优化事件处理
    const handleImageError = useCallback(() => {
        setIconState(getFailedIconState());
    }, []);

    const handleImageLoad = useCallback(() => {
        setIconState((state) => getLoadedIconState(state));
    }, []);

  const handleMouseEnter = useCallback((
    event: React.MouseEvent<HTMLElement>,
    isTitle: boolean
  ) => {
    // 仅桌面端（有 hover 能力）显示 Tooltip；触屏设备改为点击触发 Toast
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return;
    // 仅当文本被 line-clamp 折叠（scrollHeight 超出 clientHeight）时才弹提示框；
    // 未折叠则不弹，避免无意义遮挡。与移动端点击展示完整文本的判断逻辑一致。
    const target = isTitle
      ? event.currentTarget.querySelector('h3')
      : event.currentTarget.querySelector('p');
    if (target && target.scrollHeight <= target.clientHeight) return;

    // 锚定到「整张卡片」，Tooltip 用卡片 rect 定位
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const setter = isTitle ? setTitleTooltip : setDescTooltip;
    setter({ show: true, rect });
  }, []);

  // 有颜色配置时应用 Notion 配色，否则沿用主题默认样式（mounted 后再应用）
  const cardColorData = mounted
    ? getCardColorData(link.cardColor)
    : { bg: '', textColor: '', applyColor: false };

  const tagUseCardColor = cardColorData.applyColor && !theme?.includes('macintosh');

  // 底部标签计算：
  // - 角标标签来自 promo 单选字段：任何不在 HIDDEN_TAGS 里的非空值都视为角标，
  //   名称完全由 Notion 库 promo 选项决定，颜色按 BADGE_COLORS 调色板稳定分配
  // - 系统隐藏标签（底部推荐/标签广告）来自 system 单选字段，不展示给用户
  // - 普通用户自定义标签来自 tags 单选字段（最多 1 个）
  // 角标仅当 showPromoBadge（推广位/置顶卡片）为真时展示；普通列表隐藏 promo 角标
  const promoTag = showPromoBadge && link.promo && !HIDDEN_TAGS.includes(link.promo) ? link.promo : '';
  const badgeTags = promoTag ? [promoTag] : [];
  const normalTags = (link.tags ?? []).filter((t) => !HIDDEN_TAGS.includes(t));
  const visibleTags = [...badgeTags, ...normalTags];

  const actionClass = cn(
    'link-tag inline-flex items-center justify-center gap-1 px-2 py-0.5 text-xs rounded-md transition-colors shrink-0 cursor-pointer hover:opacity-80 min-h-[1.25rem]',
    tagUseCardColor
      ? 'bg-white/20'
      : 'bg-foreground/15 text-foreground/90 group-hover:bg-primary/15 group-hover:text-primary border border-foreground/10'
  );

  const actionStyle = tagUseCardColor ? { color: cardColorData.textColor } : undefined;

  const handleMouseLeave = useCallback((isTitle: boolean) => {
      const setter = isTitle ? setTitleTooltip : setDescTooltip;
    setter({ show: false, rect: null });
  }, []);

  // 轻量 Toast：屏幕底部居中，默认 2 秒后自动消失；点击内容展示完整文本用 3 秒
  const showToast = useCallback((msg: string, duration = 2000) => {
    setToast({ show: true, msg });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(
      () => setToast({ show: false, msg: '' }),
      duration
    );
  }, []);

  // 触屏设备点击标题/描述：内容被 line-clamp 截断时，将完整文本显示在「卡片上方」的提示框
  // （而非屏幕底部 Toast），避免被手指遮挡，注意力停留在当前卡片位置。
  const handleContentClick = useCallback((
    event: React.MouseEvent<HTMLElement>,
    type: 'title' | 'desc'
  ) => {
    // 仅触屏设备（无 hover 能力）走此逻辑；桌面端由 Tooltip 负责
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: none)').matches) return;
    const target = type === 'title'
      ? event.currentTarget.querySelector('h3')
      : event.currentTarget.querySelector('p');
    if (!target) return;
    // 仅当内容被截断（scrollHeight 超出 clientHeight）时才触发
    if (target.scrollHeight <= target.clientHeight) return;
    // 锚定整张卡片，与桌面端 Tooltip 定位一致
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    setTouchTooltip({
      show: true,
      rect,
      content: type === 'title' ? link.name : (link.desc ?? ''),
    });
    if (touchTimer.current) window.clearTimeout(touchTimer.current);
    touchTimer.current = window.setTimeout(
      () => setTouchTooltip({ show: false, rect: null, content: '' }),
      3000
    );
  }, [link.name, link.desc]);

  const handleCopyCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(link.command);
      showToast('已复制，快去APP打开吧！');
    } catch {
      showToast('复制失败，请手动复制');
    }
  }, [link.command, showToast]);

  const handleShare = useCallback(async () => {
    // 复制内容：标题 + 描述 + 链接（单行组合，供「只想拷贝」的用户使用）
    const combined = link.desc
      ? `${link.name} - ${link.desc} - ${link.url}`
      : `${link.name} - ${link.url}`;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      // 移动端：先在用户手势内写入剪贴板。
      // 规避 iOS 取消分享后"用户手势过期"导致 writeText 被拒、复制静默失败的问题。
      let copied = false;
      try {
        await navigator.clipboard.writeText(combined);
        copied = true;
      } catch {
        // 复制失败静默处理：链接不可见，提示用户也无法操作
      }
      // 再调起系统分享面板：选 App 真正分享时不提示
      const shareText = link.desc ? `${link.name} - ${link.desc}` : link.name;
      try {
        await navigator.share({ title: link.name, text: shareText, url: link.url });
      } catch {
        // 用户取消/关闭面板 → 剪贴板已就绪，提示复制成功
        if (copied) showToast('复制成功，快去分享吧！');
      }
      return;
    }
    // 桌面端/不支持系统分享：直接复制组合并提示（成功才提示）
    try {
      await navigator.clipboard.writeText(combined);
      showToast('复制成功，快去分享吧！');
    } catch {
      // 复制失败静默处理
    }
  }, [link.name, link.url, link.desc, showToast]);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    if (touchTimer.current) window.clearTimeout(touchTimer.current);
  }, []);

  // 移动端：页面/卡片滚动时立即关闭提示框（轻点弹框不该残留）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: none)').matches) return; // 仅触屏设备
    const closeAll = () => {
      setTitleTooltip((s) => (s.show ? { show: false, rect: null } : s));
      setDescTooltip((s) => (s.show ? { show: false, rect: null } : s));
      setTouchTooltip((s) => (s.show ? { show: false, rect: null, content: '' } : s));
    };
    window.addEventListener('scroll', closeAll, true);
    window.addEventListener('touchmove', closeAll, { passive: true });
    return () => {
      window.removeEventListener('scroll', closeAll, true);
      window.removeEventListener('touchmove', closeAll);
    };
  }, []);

  // 当 link 变化时更新图片源
  useEffect(() => {
    setIconState(getInitialIconState(link));
  }, [link]);

  // 每张卡片只对当前 link 启动一次超时兜底，避免 effect 依赖变化导致的递归更新
  const timeoutStartedRef = useRef(false);
  useEffect(() => {
    timeoutStartedRef.current = false;
  }, [link]);

  useEffect(() => {
    if (timeoutStartedRef.current) return;
    if (iconState.isLoaded || iconState.src === FALLBACK_ICON_SRC || iconState.showFallback) {
      return;
    }
    timeoutStartedRef.current = true;

    const timeoutId = window.setTimeout(() => {
      setIconState((state) => {
        if (state.isLoaded || state.src === FALLBACK_ICON_SRC || state.showFallback) {
          return state;
        }

        return getTimedOutIconState(state);
      });
    }, ICON_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [iconState.isLoaded, iconState.src, iconState.showFallback]);

  useEffect(() => {
    if (!iconState.showFallback) return;

    const syncImageStatus = () => {
      const image = iconContainerRef.current?.querySelector('img');
      if (!image?.complete) return false;

      if (image.naturalWidth > 0) {
        setIconState((state) => getLoadedIconState(state));
      } else {
        setIconState(getFailedIconState());
      }

      return true;
    };

    if (syncImageStatus()) return;

    let attempts = 0;
    const intervalId = window.setInterval(() => {
      attempts += 1;
      if (syncImageStatus() || attempts >= 30) {
        window.clearInterval(intervalId);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [iconState.showFallback]);

  return (
    <>
    <motion.div
        ref={cardRef}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        data-has-color={cardColorData.applyColor ? 'true' : undefined}
        style={cardColorData.applyColor ? {
          backgroundColor: cardColorData.bg,
          color: cardColorData.textColor,
        } : undefined}
        className={cn(
          "group flex h-full flex-col p-2.5 rounded-xl border border-border/50 bg-card hover:border-primary/50 transition-all",
          "hover:shadow-lg hover:shadow-primary/5",
          "w-full max-w-full",
          className
        )}
      >
        {/* 内容容器 */}
        <div className="flex flex-col h-full gap-2">
          {/* 图标和名称行 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* 图标容器 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="relative w-10 h-10 rounded-xl overflow-hidden transition-all shrink-0
                       bg-muted/50 p-1.5 border border-border/50"
              style={{
                backgroundColor: cardColorData.applyColor ? 'rgba(255,255,255,0.2)' : undefined,
                borderColor: cardColorData.applyColor ? 'rgba(255,255,255,0.2)' : undefined,
              }}
            >
              <div ref={iconContainerRef} className="icon-container relative w-full h-full">
                {iconState.showFallback && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-center bg-contain bg-no-repeat opacity-70"
                    style={{ backgroundImage: `url(${FALLBACK_ICON_SRC})` }}
                  />
                )}
                <OptimisedLinkIcon 
                    src={iconState.src} 
                    alt={link.name} 
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
                 
                {iconState.showSpinner && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* 网站名称和图标 */}
            <div className="flex-1 min-w-0 relative">
              <div 
                className="relative"
                onMouseEnter={(e) => handleMouseEnter(e, true)}
                onMouseLeave={() => handleMouseLeave(true)}
                onClick={(e) => handleContentClick(e, 'title')}
              >
                <h3 className={cn(
                  "text-base line-clamp-1 transition-colors",
                  cardColorData.applyColor ? "text-current" : "text-foreground group-hover:text-primary"
                )}>
                  {link.name}
                </h3>
              </div>
            </div>
          </div>

          {/* 描述行 */}
          {link.desc && (
              <div 
                className="relative flex-1 min-h-0"
                onMouseEnter={(e) => handleMouseEnter(e, false)}
                onMouseLeave={() => handleMouseLeave(false)}
                onClick={(e) => handleContentClick(e, 'desc')}
              >
              <p className="text-xs text-foreground/80
                         group-hover:text-foreground
                         line-clamp-2 transition-colors">
                {link.desc}
              </p>
            </div>
          )}

          {/* 底部行：标签 + 操作按钮（同一行，不增加卡片高度） */}
          <div className="flex items-center justify-between gap-2 mt-auto flex-shrink-0">
            {/* 标签 */}
            <div className="flex flex-wrap gap-1.5 min-w-0 flex-1">
              {visibleTags.slice(0, 3).map((tag) => {
                const isBadge = tag === promoTag;
                const badgeColor = isBadge ? getBadgeColor(tag) : undefined;
                return (
                  <span
                    key={tag}
                    className={cn(
                      'link-tag inline-flex items-center px-2 py-0.5 text-xs rounded-md transition-colors',
                      isBadge
                        ? 'text-white border-transparent'
                        : tagUseCardColor
                          ? 'bg-white/20'
                          : 'bg-foreground/15 text-foreground/90 group-hover:bg-primary/15 group-hover:text-primary border border-foreground/10',
                      !isBadge && tag.includes('力荐') && !tagUseCardColor && 'link-tag-featured'
                    )}
                    style={isBadge ? { backgroundColor: badgeColor } : (tagUseCardColor ? { color: cardColorData.textColor } : undefined)}
                    title={tag}
                  >
                    <span className="link-tag-label truncate max-w-[80px]">{tag}</span>
                  </span>
                );
              })}
              {visibleTags.length > 3 && (
                <span
                  className={cn(
                    'link-tag inline-flex items-center px-2 py-0.5 text-xs rounded-md shrink-0 transition-colors',
                    tagUseCardColor
                      ? 'bg-white/20'
                      : 'bg-foreground/15 text-foreground/90 group-hover:bg-primary/15 group-hover:text-primary border border-foreground/10'
                  )}
                  style={{
                    color: tagUseCardColor ? cardColorData.textColor : undefined,
                  }}
                >
                  +{visibleTags.length - 3}
                </span>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-1 shrink-0">
              {link.command && (
                <button
                  type="button"
                  onClick={handleCopyCommand}
                  className={actionClass}
                  style={actionStyle}
                  title="复制口令"
                  aria-label="复制口令"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleShare}
                className={actionClass}
                style={actionStyle}
                title="分享"
                aria-label="分享"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={actionClass}
                style={actionStyle}
                title="打开"
                aria-label="打开"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* 渐变悬浮效果 */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-transparent
                      group-hover:from-primary/5 group-hover:via-primary/2 group-hover:to-transparent
                      transition-colors duration-500" />
      </motion.div>

      {/* 提示框：锚定在整张卡片顶部之上，悬停标题显示标题，悬停描述显示描述 */}
      <Tooltip 
        content={link.name}
        show={titleTooltip.show}
        cardRect={titleTooltip.rect}
      />
      {link.desc && (
        <Tooltip 
          content={link.desc}
          show={descTooltip.show}
          cardRect={descTooltip.rect}
        />
      )}

      {/* 触屏设备：点击被折叠标题/描述时，完整文本显示在卡片上方的提示框 */}
      <Tooltip 
        content={touchTooltip.content}
        show={touchTooltip.show}
        cardRect={touchTooltip.rect}
      />

      {/* Toast 提示 */}
      <Toast msg={toast.msg} show={toast.show} />
    </>
  );
}, (prev, next) => {
    // Custom comparison function for React.memo
    // Only re-render if key props change
    return (
        prev.link.id === next.link.id &&
        prev.link.name === next.link.name &&
        prev.link.desc === next.link.desc &&
        prev.link.url === next.link.url &&
        prev.link.iconfile === next.link.iconfile &&
        prev.link.iconlink === next.link.iconlink &&
        prev.link.cardColor === next.link.cardColor &&
        prev.link.command === next.link.command &&
        prev.className === next.className
    );
});

export default LinkCard;
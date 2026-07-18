'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { WidgetSkeleton, HotNewsSkeleton } from '@/components/ui/Skeleton';
import { WebsiteConfig, Link } from '@/types';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import LinkCard from '@/components/ui/LinkCard';
import TagAdBar from '@/components/ui/TagAdBar';

// Dynamic imports for widgets
const SimpleTime = dynamic(() => import('@/components/widgets/SimpleTime'), {
  loading: () => <WidgetSkeleton className="w-[280px] h-[150px]" />,
  ssr: false
});

const AnalogClock = dynamic(() => import('@/components/widgets/AnalogClock'), {
  loading: () => <WidgetSkeleton className="w-[150px] h-[150px]" />,
  ssr: false
});

const Weather = dynamic(() => import('@/components/widgets/Weather'), {
  loading: () => <WidgetSkeleton className="w-[400px] h-[150px]" />,
  ssr: false
});

const IPInfo = dynamic(() => import('@/components/widgets/IPInfo'), {
  loading: () => <WidgetSkeleton className="w-[220px] h-[150px]" />,
  ssr: false
});

const HotNews = dynamic(() => import('@/components/widgets/HotNews'), {
  loading: () => <HotNewsSkeleton className="w-[300px] h-[150px]" />,
  ssr: false
});

const StockWatchlist = dynamic(() => import('@/components/widgets/StockWatchlist'), {
  loading: () => <WidgetSkeleton className="w-[340px] h-[150px]" />,
  ssr: false
});

interface HomeWidgetsProps {
    config: WebsiteConfig;
}

// 解析角标配置：热销,#FF6B6B,上新,#4ECDC4,... -> [{label,color}, ...]
function parseBadgeConfig(raw?: string): { label: string; color: string }[] {
    if (!raw) return [];
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
    const badges: { label: string; color: string }[] = [];
    for (let i = 0; i + 1 < parts.length; i += 2) {
        badges.push({ label: parts[i], color: parts[i + 1] });
    }
    return badges;
}

export default function HomeWidgets({ config }: HomeWidgetsProps) {
    const widgetMap: Record<string, React.ReactNode> = {
        '简易时钟': <SimpleTime />,
        '圆形时钟': <AnalogClock />,
        '天气': <Weather />,
        'IP信息': <IPInfo />,
        '热搜': <HotNews />,
        '自选股': <StockWatchlist />,
    };

    const widgetConfig = config.WIDGET_CONFIG?.split(',').map(s => s.trim()).filter(Boolean) ?? [];

    // 推广广告位数据
    const [promotedLinks, setPromotedLinks] = useState<Link[]>([]);
    const [loadingPromoted, setLoadingPromoted] = useState(true);
    const badgeConfig = parseBadgeConfig(config.WIDGET_BADGE_CONFIG);

    // 标签广告数据
    const [tagAdLinks, setTagAdLinks] = useState<Link[]>([]);
    const [loadingTagAds, setLoadingTagAds] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetch('/api/promoted-links')
            .then((res) => res.json())
            .then((data) => {
                if (!cancelled) setPromotedLinks(data.links ?? []);
            })
            .catch(() => {
                if (!cancelled) setPromotedLinks([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingPromoted(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        fetch('/api/tag-ads')
            .then((res) => res.json())
            .then((data) => {
                if (!cancelled && data.success && data.links) {
                    setTagAdLinks(data.links);
                }
            })
            .catch(() => {
                if (!cancelled) setTagAdLinks([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingTagAds(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const hasPromoted = !loadingPromoted && promotedLinks.length > 0;
    const hasTagAds = !loadingTagAds && tagAdLinks.length > 0;
    const { theme } = useTheme();
    const isMacintosh = theme?.includes('macintosh');

    return (
        <>
            {/* 推广广告位：无数据时整个区域不显示；仅桌面端（md+）显示，间距对齐 LinkContainer */}
            {hasPromoted && (
                <div className="hidden md:block w-full mb-2 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                    >
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
                            {promotedLinks.map((link, idx) => {
                                const badge = badgeConfig[idx];
                                return (
                                    <div key={link.id} className="relative flex-1 min-w-[180px] max-w-[220px]">
                                        {/* 右上角贴边角标，不占用标题空间；麦金塔主题微调 top 避免遮挡标题栏装饰 */}
                                        {badge && (
                                            <span
                                                className={`absolute ${isMacintosh ? 'top-5' : 'top-2'} right-2 z-10 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white pointer-events-none`}
                                                style={{ backgroundColor: badge.color }}
                                            >
                                                {badge.label}
                                            </span>
                                        )}
                                        <LinkCard link={link} />
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* 标签广告栏：无数据时整个区域不显示；仅桌面端（md+）显示 */}
            {hasTagAds && (
                <div className="hidden md:block w-full mb-8 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <TagAdBar links={tagAdLinks} theme={theme} />
                    </motion.div>
                </div>
            )}

            {widgetConfig.length > 0 && (
            <div className="hidden lg:block w-full mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden"
                >
                    <div className="flex overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                        <div className="flex space-x-4 px-1">
                            {widgetConfig.map((name, idx) => {
                                const Comp = widgetMap[name];
                                if (!Comp) return null;
                                return (
                                    <div key={name + '-' + idx} className="flex-shrink-0">
                                        {Comp}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
            )}
        </>
    );
}

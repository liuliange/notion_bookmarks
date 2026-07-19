'use client';

import React, { useEffect, useState } from 'react';
import { WebsiteConfig, Link } from '@/types';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import LinkCard from '@/components/ui/LinkCard';
import TagAdBar from '@/components/ui/TagAdBar';

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
  const badgeConfig = parseBadgeConfig(config.WIDGET_BADGE_CONFIG);

  // 推广广告位数据
  const [promotedLinks, setPromotedLinks] = useState<Link[]>([]);
  const [loadingPromoted, setLoadingPromoted] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/promoted-links')
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setPromotedLinks(data.links ?? []); })
      .catch(() => { if (!cancelled) setPromotedLinks([]); })
      .finally(() => { if (!cancelled) setLoadingPromoted(false); });
    return () => { cancelled = true; };
  }, []);

  // 标签广告数据
  const [tagAdLinks, setTagAdLinks] = useState<Link[]>([]);
  const [loadingTagAds, setLoadingTagAds] = useState(true);

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

  const hasTagAds = !loadingTagAds && tagAdLinks.length > 0;
  const hasPromoted = !loadingPromoted && promotedLinks.length > 0;
  const { theme } = useTheme();
  const isMacintosh = theme?.includes('macintosh');

  return (
    <>
      {/* 推广广告位：有数据才显示；仅桌面端（md+）显示，间距对齐 LinkContainer */}
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
                const badge = badgeConfig[idx]; // 配置缺失则该卡不显示角标
                return (
                  <div key={link.id} className="relative flex-1 min-w-[180px] max-w-[220px]">
                    {/* 右上角贴边角标，不占用标题空间；麦金塔主题下移避免遮挡标题栏装饰 */}
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
    </>
  );
}

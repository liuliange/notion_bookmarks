'use client';

import React, { useEffect, useState } from 'react';
import { Link } from '@/types';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import LinkCard from '@/components/ui/LinkCard';
import TagAdBar from '@/components/ui/TagAdBar';

export default function HomeWidgets() {
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full">
              {promotedLinks.map((link) => (
                <LinkCard key={link.id} link={link} className="w-full" showPromoBadge />
              ))}
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

// src/components/LinkContainer.tsx
"use client";

import React, { useState, useEffect, useMemo, memo } from "react";
import LinkCard from "@/components/ui/LinkCard";
import * as Icons from "lucide-react";
import { Link, Category } from '@/types';
import { useSearchContext } from '@/components/search-context';

interface LinkContainerProps {
  initialLinks: Link[];
  enabledCategories: Set<string>;
  categories: Category[];
}

const LinkContainer = memo(function LinkContainer({
  initialLinks,
  enabledCategories,
  categories,
}: LinkContainerProps) {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const { searchQuery } = useSearchContext();

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    setCurrentTime(
      now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/\//g, '-')
    );
  }, []);

  const linksByCategory = useMemo(() => {
    const filteredLinks = initialLinks.filter((link) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.trim().toLowerCase();
      const title = (link.name || '').toLowerCase();
      const desc = (link.desc || '').toLowerCase();
      const category1 = (link.category1 || '').toLowerCase();
      const category2 = (link.category2 || '').toLowerCase();
      return title.includes(query) || desc.includes(query) || 
             category1.includes(query) || category2.includes(query);
    });

    return filteredLinks.reduce((acc, link) => {
      const cat1 = link.category1;
      const cat2 = link.category2;
      if (enabledCategories.has(cat1)) {
        if (!acc[cat1]) acc[cat1] = {};
        if (!acc[cat1][cat2]) acc[cat1][cat2] = [];
        acc[cat1][cat2].push(link);
      }
      return acc;
    }, {} as Record<string, Record<string, Link[]>>);
  }, [initialLinks, enabledCategories, searchQuery]);

  const totalMatches = useMemo(() => {
    return Object.values(linksByCategory).reduce((acc, subMap) => {
      return acc + Object.values(subMap).reduce((sum, links) => sum + links.length, 0);
    }, 0);
  }, [linksByCategory]);

  return (
    <div className="space-y-16 pb-12 w-full min-w-0">
      {searchQuery.trim() && (
        <div className="text-sm text-muted-foreground border-b pb-2">
          找到 <span className="font-medium text-foreground">{totalMatches}</span> 个相关结果
        </div>
      )}

      {categories.map((category) => {
        const categoryLinks = linksByCategory[category.name];
        if (!categoryLinks) return null;

        return (
          <section
            key={category.id}
            id={category.id}
            className="category-section scroll-mt-20 space-y-8"
          >
            <div className="flex items-center space-x-3 pb-2 border-b">
              {category.iconName &&
              Icons[category.iconName as keyof typeof Icons] ? (
                <div className="w-7 h-7 p-1 rounded-lg bg-primary/5 text-primary">
                  {React.createElement(
                    Icons[
                      category.iconName as keyof typeof Icons
                    ] as React.ComponentType<{ className: string }>,
                    { className: "w-5 h-5" }
                  )}
                </div>
              ) : null}
              <h2 className="text-2xl font-bold tracking-tight">{category.name}</h2>
            </div>

            <div className="space-y-12">
              {Object.entries(categoryLinks).map(([subCategory, links]) => (
                <div
                  key={`${category.id}-${subCategory
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  id={`${category.id}-${subCategory
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-1 rounded-full bg-primary"></div>
                    <h3 className="text-lg font-medium text-foreground/90">
                      {subCategory}
                    </h3>
                    <div className="text-sm text-muted-foreground">({links.length})</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full">
                    {links.map((link) => (
                      <LinkCard key={link.id} link={link} className="w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {searchQuery.trim() && totalMatches === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            没有找到与“<span className="font-medium text-foreground">{searchQuery.trim()}</span>”相关的结果，
            添加客服微信 <span className="font-medium">525821377</span> 帮忙查询，
            或
            <a
              href="https://jianpianyi.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block ml-1 px-2 py-0.5 rounded-full text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors no-underline"
            >
              点击这里
            </a>
            前往首页查看更多优惠
          </p>
        </div>
      )}

      {mounted && currentTime && (
        <div className="mt-12 text-center text-sm text-muted-foreground">
          最近更新：{currentTime}
        </div>
      )}
    </div>
  );
});

export default LinkContainer;
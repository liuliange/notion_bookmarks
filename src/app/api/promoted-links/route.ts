// src/app/api/promoted-links/route.ts
import { getLinks } from '@/lib/notion';
import { NextResponse } from 'next/server';

// 推广广告位使用的标签，过滤后需从卡片中移除
const PROMOTED_TAG = '置顶推广';
const MAX_PROMOTED = 5;

export async function GET() {
  try {
    const allLinks = await getLinks();

    const promotedLinks = allLinks
      .filter((link) => link.tags?.includes(PROMOTED_TAG))
      .map((link) => ({
        ...link,
        // 移除推广标签，避免显示在卡片底部
        tags: link.tags.filter((tag) => tag !== PROMOTED_TAG),
      }))
      .slice(0, MAX_PROMOTED);

    return NextResponse.json({ links: promotedLinks });
  } catch (error) {
    console.error('获取推广链接失败:', error);
    return NextResponse.json({ links: [] });
  }
}

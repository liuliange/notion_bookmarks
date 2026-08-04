// src/app/api/promoted-links/route.ts
import { getLinks } from '@/lib/notion';
import { NextResponse } from 'next/server';
import { MAX_PROMOTED } from '@/lib/tags';

export const revalidate = 3600;

export async function GET() {
  try {
    const allLinks = await getLinks();

    // 角标标签（名称由 Notion promo 单选字段决定）同时承担「置顶」与「底部角标」功能。
    // promo 字段里任何非空值都视为置顶角标卡，返回前端由卡片渲染。
    const promotedLinks = allLinks
      .filter((link) => Boolean(link.promo))
      .slice(0, MAX_PROMOTED);

    return NextResponse.json({ links: promotedLinks });
  } catch (error) {
    console.error('获取推广链接失败:', error);
    return NextResponse.json(
      { error: '获取推广链接失败' },
      { status: 500 }
    );
  }
}

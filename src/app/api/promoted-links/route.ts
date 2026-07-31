// src/app/api/promoted-links/route.ts
import { getLinks } from '@/lib/notion';
import { NextResponse } from 'next/server';
import { BADGE_TAGS, MAX_PROMOTED } from '@/lib/tags';

export const revalidate = 3600;

export async function GET() {
  try {
    const allLinks = await getLinks();

    // 角标标签（领优惠券/好物精选等）同时承担「置顶」与「底部角标」功能，
    // 不再剥离，随 tags 返回前端由卡片渲染。
    const promotedLinks = allLinks
      .filter((link) => link.tags?.some((t) => BADGE_TAGS.includes(t)))
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

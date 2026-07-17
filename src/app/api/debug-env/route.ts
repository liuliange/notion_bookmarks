import { NextResponse } from 'next/server';
import { getLinks, getCategories, getWebsiteConfig } from '@/lib/notion';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result: Record<string, unknown> = {
    env: {
      NOTION_LINKS_DB_ID: process.env.NOTION_LINKS_DB_ID,
      NOTION_CATEGORIES_DB_ID: process.env.NOTION_CATEGORIES_DB_ID,
      NOTION_WEBSITE_CONFIG_ID: process.env.NOTION_WEBSITE_CONFIG_ID,
      NOTION_TOKEN_PREFIX: (process.env.NOTION_TOKEN ?? '').slice(0, 12) + '...',
    },
  };

  // 尝试拉取链接
  try {
    const links = await getLinks();
    result.linksCount = links.length;
  } catch (e: unknown) {
    result.linksError = e instanceof Error ? e.message : String(e);
  }

  // 尝试拉取分类
  try {
    const categories = await getCategories();
    result.categoriesCount = categories.length;
  } catch (e: unknown) {
    result.categoriesError = e instanceof Error ? e.message : String(e);
  }

  // 尝试拉取网站配置
  try {
    const config = await getWebsiteConfig();
    result.configTitle = config.SITE_TITLE;
  } catch (e: unknown) {
    result.configError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(result);
}

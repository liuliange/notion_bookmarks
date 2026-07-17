import { NextResponse } from 'next/server';
import { getLinks, getCategories, getWebsiteConfig } from '@/lib/notion';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result: any = {
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
  } catch (e: any) {
    result.linksError = e?.message ?? String(e);
  }

  // 尝试拉取分类
  try {
    const categories = await getCategories();
    result.categoriesCount = categories.length;
  } catch (e: any) {
    result.categoriesError = e?.message ?? String(e);
  }

  // 尝试拉取网站配置
  try {
    const config = await getWebsiteConfig();
    result.configTitle = config.SITE_TITLE;
  } catch (e: any) {
    result.configError = e?.message ?? String(e);
  }

  return NextResponse.json(result);
}

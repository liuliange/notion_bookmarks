import { NextResponse } from 'next/server';
import { notion, getLinks, getCategories, getWebsiteConfig } from '@/lib/notion';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result: Record<string, unknown> = {
    env: {
      NOTION_LINKS_DB_ID: process.env.NOTION_LINKS_DB_ID,
      NOTION_CATEGORIES_DB_ID: process.env.NOTION_CATEGORIES_DB_ID,
      NOTION_WEBSITE_CONFIG_ID: process.env.NOTION_WEBSITE_CONFIG_ID,
      NOTION_TOKEN: process.env.NOTION_TOKEN,
    },
  };

  // 验证链接库元信息
  try {
    const db = await notion.databases.retrieve({ database_id: process.env.NOTION_LINKS_DB_ID! });
    result.linksDb = {
      title: (db as { title?: { plain_text: string }[] }).title?.map((t) => t.plain_text).join('') || '(无)',
      created_time: (db as { created_time?: string }).created_time,
      last_edited_time: (db as { last_edited_time?: string }).last_edited_time,
    };
  } catch (e: unknown) {
    result.linksDbError = e instanceof Error ? e.message : String(e);
  }

  // 验证分类库元信息
  try {
    const db = await notion.databases.retrieve({ database_id: process.env.NOTION_CATEGORIES_DB_ID! });
    result.categoriesDb = {
      title: (db as { title?: { plain_text: string }[] }).title?.map((t) => t.plain_text).join('') || '(无)',
      last_edited_time: (db as { last_edited_time?: string }).last_edited_time,
    };
  } catch (e: unknown) {
    result.categoriesDbError = e instanceof Error ? e.message : String(e);
  }

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

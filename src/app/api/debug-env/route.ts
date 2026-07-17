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

  // 直接 query 链接库（绕开 getLinks 内部的 sort/filter）
  try {
    const directQuery = await notion.databases.query({ database_id: process.env.NOTION_LINKS_DB_ID!, page_size: 100 });
    result.directQueryNoSort = {
      count: directQuery.results.length,
      has_more: directQuery.has_more,
      firstPagePropKeys: directQuery.results[0] ? Object.keys(directQuery.results[0].properties) : null,
    };
  } catch (e: unknown) {
    result.directQueryNoSortError = e instanceof Error ? e.message : String(e);
  }

  // 直接 query 链接库（带 getLinks 同款 sort）
  try {
    const sortedQuery = await notion.databases.query({
      database_id: process.env.NOTION_LINKS_DB_ID!,
      page_size: 100,
      sorts: [
        { property: 'category1', direction: 'ascending' },
        { property: 'category2', direction: 'ascending' },
      ],
    });
    result.directQueryWithSort = {
      count: sortedQuery.results.length,
      has_more: sortedQuery.has_more,
    };
  } catch (e: unknown) {
    result.directQueryWithSortError = e instanceof Error ? e.message : String(e);
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

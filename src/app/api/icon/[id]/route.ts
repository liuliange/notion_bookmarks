// 代理 Notion 托管的图标文件。
// Notion 文件属性返回的签名 URL 约 1 小时过期，直接写进静态页面会导致线上图标失效。
// 本路由在每次图片加载时重新向 Notion 拉取最新签名 URL 并转发图片内容，
// 由 CDN 缓存 1 小时，从而彻底规避过期问题。
import { notion } from '@/lib/notion';
import { extractFileUrl } from '@/types/notion/common';
import type { FilesPropertyItemObjectResponse } from '@notionhq/client/build/src/api-endpoints';

// 每小时重新向 Notion 取一次最新签名 URL（签名有效期约 1 小时，留足余量）
export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const page = await notion.pages.retrieve({ page_id: id });

    const fileProp = (page as { properties?: Record<string, unknown> }).properties?.iconfile as
      | FilesPropertyItemObjectResponse
      | undefined;

    const url = fileProp ? extractFileUrl(fileProp) : '';

    if (!url) {
      return new Response('Icon not found', { status: 404 });
    }

    const upstream = await fetch(url, { cache: 'no-store' });
    if (!upstream.ok) {
      return new Response('Failed to fetch icon from Notion', { status: 502 });
    }

    const buffer = await upstream.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('获取图标失败:', error);
    return new Response('Internal error', { status: 500 });
  }
}

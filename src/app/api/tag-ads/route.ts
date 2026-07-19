import { NextResponse } from 'next/server';
import { getLinks } from '@/lib/notion';
import { TAG_AD_TAG } from '@/lib/tags';

export async function GET() {
    try {
        const allLinks = await getLinks();

        const tagAdLinks = allLinks.filter(
            link => Array.isArray(link.tags) && link.tags.includes(TAG_AD_TAG)
        );

        return NextResponse.json({
            success: true,
            links: tagAdLinks
        });
    } catch (error) {
        console.error('获取标签广告失败:', error);
        return NextResponse.json(
            { success: false, error: '获取数据失败' },
            { status: 500 }
        );
    }
}

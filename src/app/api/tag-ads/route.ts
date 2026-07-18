import { NextResponse } from 'next/server';
import { getLinks } from '@/lib/notion';

export async function GET() {
    try {
        const allLinks = await getLinks();

        const tagAdLinks = allLinks.filter(link => {
            if (Array.isArray(link.tags)) {
                return link.tags.includes('标签广告');
            }
            if (typeof link.tags === 'string') {
                return link.tags.includes('标签广告');
            }
            return false;
        });

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

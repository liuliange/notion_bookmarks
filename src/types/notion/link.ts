import {
    PageObjectResponse,
    TitlePropertyItemObjectResponse,
    RichTextPropertyItemObjectResponse,
    UrlPropertyItemObjectResponse,
    SelectPropertyItemObjectResponse,
    FilesPropertyItemObjectResponse,
    MultiSelectPropertyItemObjectResponse,
    CreatedTimePropertyItemObjectResponse
} from "@notionhq/client/build/src/api-endpoints";
import {
    isPageObjectResponse,
    extractTitle,
    extractRichText,
    extractUrl,
    extractSelect,
    extractFileInfo,
    extractMultiSelect
} from "./common";
import { downloadIcon } from '@/lib/icon-sync';

// Precise Definition of Notion Properties for Links Database
export interface NotionLinkProperties {
    Name: TitlePropertyItemObjectResponse;
    URL: UrlPropertyItemObjectResponse;
    desc: RichTextPropertyItemObjectResponse;
    category1: SelectPropertyItemObjectResponse;
    category2: SelectPropertyItemObjectResponse;
    Tags: MultiSelectPropertyItemObjectResponse;
    iconfile: FilesPropertyItemObjectResponse;
    iconlink: UrlPropertyItemObjectResponse;
    Created: CreatedTimePropertyItemObjectResponse;
    // 🆕 新增 color 字段（十五种预设颜色）- 可选字段，不强制要求所有数据都有
    color?: SelectPropertyItemObjectResponse;
}

// Domain Model
export interface Link {
    id: string;
    name: string;
    created: string;
    desc: string;
    url: string;
    category1: string;
    category2: string;
    iconfile: string;
    iconlink: string;
    tags: string[];
    // 🆕 新增 cardColor 字段
    cardColor: string;
}

// Type Guard
export function isNotionLinkPage(
    page: unknown
): page is PageObjectResponse & { properties: NotionLinkProperties } {
    if (!isPageObjectResponse(page)) return false;

    const props = page.properties;
    return (
        'Name' in props &&
        'URL' in props &&
        'desc' in props &&
        'category1' in props &&
        'category2' in props &&
        'Tags' in props &&
        'iconfile' in props &&
        'iconlink' in props
        // ✅ color 字段可选，不强制检查
        // ✅ Created 改为可选，用 page.created_time 兜底
    );
}

// Transformer
export async function toLink(page: PageObjectResponse & { properties: NotionLinkProperties }): Promise<Link> {
    const props = page.properties;

    // Notion 托管的文件 URL 会过期：优先下载到本地静态托管，失败则回退中转站代理
    const file = extractFileInfo(props.iconfile);
    let iconfile = '';
    if (file.url && !file.isNotionHosted) {
        iconfile = file.url;
    } else if (file.url && file.isNotionHosted) {
        iconfile = (await downloadIcon(page.id, file.url)) ?? `/api/icon/${page.id}`;
    }

    return {
        id: page.id,
        name: extractTitle(props.Name),
        created: props.Created?.created_time || page.created_time,
        desc: extractRichText(props.desc),
        url: extractUrl(props.URL) || '#',
        category1: extractSelect(props.category1) || '未分类',
        category2: extractSelect(props.category2) || '默认',
        iconfile,
        iconlink: extractUrl(props.iconlink),
        tags: extractMultiSelect(props.Tags),
        // 🆕 直接使用可选链提取 color 字段值
        cardColor: props.color?.select?.name || '',
    };
}
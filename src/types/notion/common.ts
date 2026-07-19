import {
    PageObjectResponse,
    TitlePropertyItemObjectResponse,
    RichTextPropertyItemObjectResponse,
    UrlPropertyItemObjectResponse,
    SelectPropertyItemObjectResponse,
    FilesPropertyItemObjectResponse,
    MultiSelectPropertyItemObjectResponse
} from "@notionhq/client/build/src/api-endpoints";

export function isPageObjectResponse(page: unknown): page is PageObjectResponse {
    return (page as PageObjectResponse).object === 'page';
}

export function extractTitle(prop: TitlePropertyItemObjectResponse): string {
    if (prop.type === 'title' && prop.title && Array.isArray(prop.title) && prop.title.length > 0) {
        return prop.title.map((t) => t.plain_text).join('');
    }
    return '';
}

export function extractRichText(prop: RichTextPropertyItemObjectResponse): string {
    if (prop.type === 'rich_text' && prop.rich_text && Array.isArray(prop.rich_text) && prop.rich_text.length > 0) {
        return prop.rich_text.map((t) => t.plain_text).join('');
    }
    return '';
}

export function extractUrl(prop: UrlPropertyItemObjectResponse): string {
    if (prop.type === 'url' && prop.url) {
        return prop.url;
    }
    return '';
}

export function extractSelect(prop: SelectPropertyItemObjectResponse | undefined): string {
    if (!prop) return '';
    if (prop.type === 'select' && prop.select) {
        return prop.select.name || '';
    }
    return '';
}

export function extractFileUrl(prop: FilesPropertyItemObjectResponse): string {
    if (prop.type === 'files' && prop.files && Array.isArray(prop.files) && prop.files.length > 0) {
        const file = prop.files[0];
        if (file.type === 'file') {
            return file.file.url;
        } else if (file.type === 'external') {
            return file.external.url;
        }
    }
    return '';
}

/**
 * 解析 Notion 文件属性。
 * - type === 'file'：Notion 托管的文件，URL 为带签名的临时链接（约 1 小时过期），需走代理刷新。
 * - type === 'external'：用户填写的外链，稳定不过期。
 */
export function extractFileInfo(prop: FilesPropertyItemObjectResponse): { url: string; isNotionHosted: boolean } {
    if (prop.type === 'files' && prop.files && Array.isArray(prop.files) && prop.files.length > 0) {
        const file = prop.files[0];
        if (file.type === 'file') {
            return { url: file.file.url, isNotionHosted: true };
        } else if (file.type === 'external') {
            return { url: file.external.url, isNotionHosted: false };
        }
    }
    return { url: '', isNotionHosted: false };
}

export function extractMultiSelect(prop: MultiSelectPropertyItemObjectResponse): string[] {
    if (prop.type === 'multi_select' && prop.multi_select && Array.isArray(prop.multi_select)) {
        return prop.multi_select.map((item) => item.name);
    }
    return [];
}
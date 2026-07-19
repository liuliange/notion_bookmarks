// 图标本地化：把 Notion 托管的图标下载到 public/uploads，避免签名 URL 过期。
// - 构建/发布时：可写，下载成功 → 图标作为网站静态文件托管（零函数消耗、永久有效）。
// - 运行时（只读环境）或下载失败：回退到 /api/icon/[id] 中转站兜底。
import fs from 'node:fs';
import path from 'node:path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

function extFromContentType(contentType: string | null): string {
  switch (contentType) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'png';
  }
}

/** 本地是否已有该图标（部署产物或已下载），返回相对路径或 null */
export function localIconExists(id: string): string | null {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) return null;
    const hit = fs.readdirSync(UPLOAD_DIR).find((f) => f.startsWith(`${id}.`));
    return hit ? `/uploads/${hit}` : null;
  } catch {
    return null;
  }
}

/**
 * 下载 Notion 托管图标到 public/uploads，返回本地相对路径。
 * 已存在则直接复用；失败（只读环境 / 网络错误）返回 null，交由中转站兜底。
 */
export async function downloadIcon(id: string, url: string): Promise<string | null> {
  const existing = localIconExists(id);
  if (existing) return existing;

  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const ext = extFromContentType(res.headers.get('content-type'));
    const abs = path.join(UPLOAD_DIR, `${id}.${ext}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(abs, buf);
    return `/uploads/${id}.${ext}`;
  } catch {
    // 只读环境（运行时 ISR）或网络失败：返回 null，调用方回退中转站
    return null;
  }
}

/** 清理 public/uploads 中已无对应链接的孤儿文件（Notion 删除后自动回收空间） */
export function cleanupOrphanIcons(validIds: Set<string>): void {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) return;
    for (const file of fs.readdirSync(UPLOAD_DIR)) {
      const id = file.split('.')[0];
      if (!validIds.has(id)) {
        fs.rmSync(path.join(UPLOAD_DIR, file), { force: true });
      }
    }
  } catch {
    // 只读环境跳过
  }
}

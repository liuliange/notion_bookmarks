// 诊断脚本：检查三个 Notion 数据库能否被当前集成访问
// 用法：node scripts/check-notion.mjs
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { Client } = require('@notionhq/client');

function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(resolve('.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch (e) {
    console.error('读取 .env.local 失败:', e.message);
  }
  return env;
}

const env = loadEnv();
const notion = new Client({ auth: env.NOTION_TOKEN, timeoutMs: 10000 });

const dbs = [
  ['NOTION_LINKS_DB_ID', '导航链接'],
  ['NOTION_WEBSITE_CONFIG_ID', '网站配置'],
  ['NOTION_CATEGORIES_DB_ID', '分类'],
];

let allOk = true;
for (const [key, label] of dbs) {
  const id = env[key];
  if (!id) {
    console.log(`❌ ${label} (${key}): 未配置`);
    allOk = false;
    continue;
  }
  try {
    const res = await notion.databases.retrieve({ database_id: id });
    const title = res.title?.map((t) => t.plain_text).join('') || '(无标题)';
    console.log(`✅ ${label} (${key}): 可访问，标题="${title}"`);
  } catch (e) {
    allOk = false;
    const code = e?.code || e?.body?.code || '';
    console.log(`❌ ${label} (${key}): ${code || e.message}`);
  }
}
console.log(allOk ? '\n✅ 三个数据库全部正常' : '\n⚠️ 存在无法访问的数据库');
process.exit(allOk ? 0 : 1);

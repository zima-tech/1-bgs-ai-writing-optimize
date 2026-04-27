import fs from 'node:fs';

const requiredPaths = [
  'app/layout.tsx',
  'app/login/page.tsx',
  'app/(dashboard)/writing/page.tsx',
  'app/(dashboard)/proofread/page.tsx',
  'app/(dashboard)/users/page.tsx',
  'app/(dashboard)/audit-logs/page.tsx',
  'app/(dashboard)/settings/page.tsx',
  'prisma/schema.prisma',
  'prisma/seed.ts'
];

const missing = requiredPaths.filter((path) => !fs.existsSync(path));

if (missing.length > 0) {
  console.error('结构校验失败，缺少以下关键文件：');
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log('结构校验通过。');

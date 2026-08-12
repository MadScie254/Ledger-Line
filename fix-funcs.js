const fs = require('fs');
const files = [
  'apps/web/app/api/settings/import/batches/route.ts',
  'apps/web/app/api/business-feed/query/route.ts',
  'apps/web/app/api/banking/transactions/route.ts'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/function minorToDecimal\(amountMinor: number\) \{[\s\S]*?\}\r?\n?/g, '');
  content = content.replace(/function decimalToMinor\(amount: Prisma\.Decimal\) \{[\s\S]*?\}\r?\n?/g, '');
  
  if (content.includes('@ledgerline/ledger-service') && !content.includes('minorToDecimal')) {
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+["']@ledgerline\/ledger-service["']/, 'import { $1, minorToDecimal, decimalToMinor } from "@ledgerline/ledger-service"');
  } else if (!content.includes('minorToDecimal')) {
    content = 'import { minorToDecimal, decimalToMinor } from "@ledgerline/ledger-service";\n' + content;
  }
  
  fs.writeFileSync(file, content);
  console.log('Updated', file);
}

const fs = require('fs');
const file = 'apps/web/app/api/entities/[entity]/route.ts';

let content = fs.readFileSync(file, 'utf8');

// 1. Remove minorToDecimal and decimalToMinor functions
content = content.replace(/function minorToDecimal\(amountMinor: number\) \{[\s\S]*?\}\r?\n?/g, '');
content = content.replace(/function decimalToMinor\(amount: Prisma\.Decimal\) \{[\s\S]*?\}\r?\n?/g, '');

// 2. Add imports
if (content.includes('@ledgerline/ledger-service') && !content.includes('minorToDecimal')) {
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+["']@ledgerline\/ledger-service["']/, 'import { $1, minorToDecimal, decimalToMinor } from "@ledgerline/ledger-service"');
} else if (!content.includes('minorToDecimal')) {
  content = 'import { minorToDecimal, decimalToMinor } from "@ledgerline/ledger-service";\n' + content;
}

// 3. Remove GET fallback
content = content.replace(/if\s+\(isDatabaseUnavailable\(error\)\)\s+\{\s+return NextResponse\.json\(\{\s+records:\s+getDemoEntityRecords\(entity\s+as\s+EntityKey\),\s+source:\s+"demo"\s+\}\);\s+\}/, '');

// 4. Remove formatError fallback
content = content.replace(/if\s+\(isDatabaseUnavailable\(error\)\)\s+\{\s+return\s+"The\s+local\s+database\s+is\s+unavailable\.\s+Showing\s+demo\s+records\s+instead\.";\s+\}/, '');

// 5. Remove isDatabaseUnavailable and getDemoEntityRecords functions
content = content.replace(/function isDatabaseUnavailable\(error: unknown\) \{[\s\S]*?\}\r?\n?/g, '');
content = content.replace(/function getDemoEntityRecords\(entity: EntityKey\) \{[\s\S]*?default:\s+return \[\];\s+\}\r?\n\}/g, '');

fs.writeFileSync(file, content);
console.log('Fixed entities route.');

import fs from 'fs';

const filePath = 'scripts/generate-catalog.mjs';
let content = fs.readFileSync(filePath, 'utf8');

const arrayMatch = content.match(/const rawProducts = (\[[\s\S]*?\]);/);
if (!arrayMatch) process.exit(1);

const rawProductsStr = arrayMatch[1];
let rawProducts = eval(rawProductsStr);

const names = new Set();
const uniqueProducts = [];
let removed = 0;

rawProducts.forEach(p => {
    const normalName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!names.has(normalName)) {
        names.add(normalName);
        uniqueProducts.push(p);
    } else {
        removed++;
        console.log(`Removing duplicate: ${p.name}`);
    }
});

// Re-stringify the array nicely
let newArrayStr = '[\n';
uniqueProducts.forEach((p, idx) => {
    let str = `  { name: '${p.name.replace(/'/g, "\\'")}', price: ${p.price}`;
    if (p.colors !== undefined) str += `, colors: '${p.colors.replace(/'/g, "\\'")}'`;
    if (p.sizes !== undefined) str += `, sizes: '${p.sizes.replace(/'/g, "\\'")}'`;
    str += `, prefix: '${p.prefix}' }`;
    if (idx < uniqueProducts.length - 1) str += ',\n';
    else str += '\n';
});
newArrayStr += ']';

content = content.replace(arrayMatch[1], newArrayStr);
fs.writeFileSync(filePath, content, 'utf8');

console.log(`Removed ${removed} duplicates.`);

import fs from 'fs';

const lines = fs.readFileSync('scripts/recovered_chunks.txt', 'utf8').split('\n');

const products = [];
const seen = new Set();

for (let line of lines) {
    line = line.trim();
    if (line.startsWith('{ name:')) {
        // Remove trailing commas or brackets
        if (line.endsWith('},')) line = line.substring(0, line.length - 1);
        if (line.endsWith('}')) line = line;
        if (line.endsWith('],')) line = line.substring(0, line.length - 2);
        if (line.endsWith('];')) line = line.substring(0, line.length - 2);
        
        try {
            const obj = eval(`(${line})`);
            const normalName = obj.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!seen.has(normalName)) {
                seen.add(normalName);
                products.push(obj);
            }
        } catch(e) {
            console.error('Error parsing line:', line, e);
        }
    }
}

let newArrayStr = 'const rawProducts = [\n';
products.forEach((p, idx) => {
    let str = `  { name: '${p.name.replace(/'/g, "\\'")}', price: ${p.price}`;
    if (p.colors !== undefined) str += `, colors: '${p.colors.replace(/'/g, "\\'")}'`;
    if (p.sizes !== undefined) str += `, sizes: '${p.sizes.replace(/'/g, "\\'")}'`;
    str += `, prefix: '${p.prefix}' }`;
    if (idx < products.length - 1) str += ',\n';
    else str += '\n';
    newArrayStr += str;
});
newArrayStr += '];\n';

let content = fs.readFileSync('scripts/generate-catalog.mjs', 'utf8');
const parts1 = content.split('const rawProducts = [');
const parts2 = parts1[1].split('const generateSlug');

const finalContent = parts1[0] + newArrayStr + '\nconst generateSlug' + parts2.slice(1).join('const generateSlug');

fs.writeFileSync('scripts/generate-catalog.mjs', finalContent, 'utf8');

console.log(`Recovered and injected ${products.length} unique products.`);

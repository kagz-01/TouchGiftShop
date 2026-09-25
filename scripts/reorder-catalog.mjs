import fs from 'fs';

const targetOrder = [
    { name: 'DIAMOND SET 002', price: 2920, colors: 'BLACK, RED, BLUE AND GREEN', prefix: 'SET' },
    { name: 'ECO-MID PEN SET', price: 780, colors: 'WHITE, GREEN, BLUE, ORANGE AND GREY', prefix: 'SET' },
    { name: 'notebook code 500', price: 385, colors: 'black, yellow, cyan, purple, grey, Navy blue and royal blue', prefix: 'NBK' },
    { name: 'CR015 CRYSTAL AWARD', price: 5500, colors: '', prefix: 'AWD' },
    { name: 'E545 NOTEBOOK', price: 450, colors: 'RED, BLACK, GRAY AND GREEN', prefix: 'NBK' },
    { name: 'GOLD BAR NOTEBOOK', price: 450, colors: 'BLUE, RED, GREY, GREEN AND BROWN', prefix: 'NBK' },
    { name: 'SKIN FEEL SET 030', price: 2380, colors: 'blue, red and black', prefix: 'SET' },
    { name: 'KNY-16 CRYSTAL AWARD', price: 4000, colors: '', prefix: 'AWD' },
    { name: 'WOODSIDE ECO-NOTEBOOK.', price: 400, colors: 'BLACK, WHITE, BLUE, RED, GREY, ORANGE, GREEN, BROWN', prefix: 'NBK' },
    { name: 'LADY LUCK & GENTLE JACK GIFT BOX', price: 1000, colors: '', sizes: 'Lady luck size L-33cm W-25cm H-12cm Gentle jack size L- 38cm W- 26cm H-13cm', prefix: 'BOX' },
    { name: 'Notebook code638-25', price: 400, colors: 'black, red, green, blue, light blue, grey and brown', prefix: 'NBK' },
    { name: 'clock 1676', price: 2000, colors: '', prefix: 'CLK' },
    { name: 'KNY-001 CRYSTAL AWARD', price: 3200, colors: '', prefix: 'AWD' },
    { name: 'ITALIAN DESIGN PEN CASES', price: 500, colors: '', prefix: 'ACC' },
    { name: 'SUBLIMATION FRIDGE MAGNETS', price: 160, colors: 'SILVER, GOLD AND BLACK', prefix: 'ACC' }
];

let content = fs.readFileSync('scripts/generate-catalog.mjs', 'utf8');
const arrayMatch = content.match(/const rawProducts = (\[[\s\S]*?\]);/);
if (!arrayMatch) process.exit(1);

let rawProducts = eval(arrayMatch[1]);
const remainingProducts = [];

const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

const targetNames = targetOrder.map(t => normalize(t.name));

for (const p of rawProducts) {
    if (!targetNames.includes(normalize(p.name))) {
        remainingProducts.push(p);
    }
}

const finalProducts = [...targetOrder, ...remainingProducts];

let newArrayStr = '[\n';
finalProducts.forEach((p, idx) => {
    let str = `  { name: '${p.name.replace(/'/g, "\\'")}', price: ${p.price}`;
    if (p.colors !== undefined) str += `, colors: '${p.colors.replace(/'/g, "\\'")}'`;
    if (p.sizes !== undefined) str += `, sizes: '${p.sizes.replace(/'/g, "\\'")}'`;
    str += `, prefix: '${p.prefix}' }`;
    if (idx < finalProducts.length - 1) str += ',\n';
    else str += '\n';
    newArrayStr += str;
});
newArrayStr += ']';

content = content.replace(arrayMatch[1], newArrayStr);
fs.writeFileSync('scripts/generate-catalog.mjs', content, 'utf8');
console.log('Reordered products and injected missing ones successfully');

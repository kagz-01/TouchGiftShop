import fs from 'fs';
import path from 'path';

const fileContent = fs.readFileSync('scripts/generate-catalog.mjs', 'utf8');
const arrayMatch = fileContent.match(/const rawProducts = (\[[\s\S]*?\]);/);

if (!arrayMatch) {
    console.error("Could not find rawProducts array");
    process.exit(1);
}

const rawProductsStr = arrayMatch[1];
let rawProducts;
try {
    rawProducts = eval(rawProductsStr);
} catch (e) {
    console.error("Error evaluating array:", e);
    process.exit(1);
}

const names = {};
const duplicates = [];

rawProducts.forEach((p, index) => {
    // Normalize name
    const normalName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (names[normalName]) {
        duplicates.push({
            original: names[normalName].name,
            duplicate: p.name,
            originalIndex: names[normalName].index,
            duplicateIndex: index
        });
    } else {
        names[normalName] = { name: p.name, index };
    }
});

if (duplicates.length > 0) {
    console.log("Found EXACT duplicates (ignoring spaces/punctuation):");
    duplicates.forEach(d => {
        console.log(`- '${d.original}' (index ${d.originalIndex}) is duplicated by '${d.duplicate}' (index ${d.duplicateIndex})`);
    });
} else {
    console.log("No exact duplicates found.");
}

// Find similar names (e.g. contains the same words)
console.log("\nChecking for potential redundancy (similar words)...");
const getWords = (name) => name.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2);

const similar = [];
for (let i = 0; i < rawProducts.length; i++) {
    const wordsI = getWords(rawProducts[i].name);
    for (let j = i + 1; j < rawProducts.length; j++) {
        const wordsJ = getWords(rawProducts[j].name);
        
        // check intersection
        const intersection = wordsI.filter(w => wordsJ.includes(w));
        const union = new Set([...wordsI, ...wordsJ]).size;
        
        if (union > 0 && intersection.length / union > 0.7) {
            similar.push(`'${rawProducts[i].name}' and '${rawProducts[j].name}' are very similar.`);
        }
    }
}

if (similar.length > 0) {
    similar.forEach(s => console.log("- " + s));
} else {
    console.log("No highly similar items found.");
}

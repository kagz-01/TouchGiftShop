import sharp from "sharp";
import fs from "fs";
import path from "path";

const SRC_DIR = "public/Hero";
const OUT_DIR = "public/Hero";

const files = fs.readdirSync(SRC_DIR).filter((f) => !f.endsWith(".webp"));

for (const file of files) {
  const src = path.join(SRC_DIR, file);
  // Clean name: kebab-case, lowercase
  const base = file
    .replace(/\.(jpe?g|png|webp)$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const out = path.join(OUT_DIR, `${base}.webp`);

  await sharp(src)
    .resize({ width: 800, withoutEnlargement: true })
    .sharpen({ sigma: 0.8, m1: 0.5, m2: 0.7 })
    .modulate({ saturation: 1.06, brightness: 1.02 })
    .webp({ quality: 92, effort: 6, smartSubsample: true })
    .toFile(out);

  const before = fs.statSync(src).size;
  const after = fs.statSync(out).size;
  console.log(`${file} -> ${path.basename(out)} (${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB)`);
}
console.log("Done");

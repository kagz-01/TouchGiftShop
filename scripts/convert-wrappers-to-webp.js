#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const WRAPPERS_DIR = path.join(ROOT, 'public', 'wrappers');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    quality: 95,
    lossless: false,
    overwrite: false,
    skipExisting: true,
    recursive: false,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--quality' && args[i + 1]) {
      opts.quality = Number(args[++i]) || opts.quality;
    } else if (a === '--lossless') {
      opts.lossless = true;
    } else if (a === '--overwrite') {
      opts.overwrite = true;
    } else if (a === '--no-skip-existing') {
      opts.skipExisting = false;
    } else if (a === '--recursive') {
      opts.recursive = true;
    }
  }

  return opts;
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch (e) {
    return false;
  }
}

async function convertFile(filePath, opts) {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath, ext);
  const dir = path.dirname(filePath);
  const outName = base + '.webp';
  const outPath = path.join(dir, outName);

  if (opts.skipExisting) {
    try {
      await fs.access(outPath);
      console.log('Skipping (exists):', outPath);
      return;
    } catch (e) {
      // continue
    }
  }

  try {
    const webpOptions = {
      quality: opts.quality,
      alphaQuality: 100,
      reductionEffort: 6,
    };

    if (opts.lossless) {
      webpOptions.lossless = true;
    } else {
      webpOptions.nearLossless = true;
    }

    await sharp(filePath)
      .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
      .withMetadata()
      .webp({
        quality: 82,
        alphaQuality: 90,
        effort: 6,
        smartSubsample: true,
        ...webpOptions,
      })
      .toFile(outPath);

    if (opts.overwrite) {
      try {
        await fs.unlink(filePath);
        // rename already produced outPath to ensure extension
        await fs.rename(outPath, path.join(dir, base + '.webp'));
      } catch (e) {
        // ignore
      }
    }

    console.log('Converted:', path.relative(ROOT, filePath), '->', path.relative(ROOT, outPath));
  } catch (err) {
    console.error('Failed converting', filePath, err.message || err);
  }
}

async function walkAndCollect(dir, recursive) {
  const results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (recursive) {
        const sub = await walkAndCollect(full, recursive);
        results.push(...sub);
      }
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.bmp', '.tiff'].includes(ext)) {
        results.push(full);
      }
    }
  }
  return results;
}

async function main() {
  const opts = parseArgs();

  const ok = await exists(WRAPPERS_DIR);
  if (!ok) {
    console.error('Directory not found:', WRAPPERS_DIR);
    process.exit(1);
  }

  const images = await walkAndCollect(WRAPPERS_DIR, opts.recursive);

  if (images.length === 0) {
    console.log('No convertible images found in', WRAPPERS_DIR);
    return;
  }

  for (const f of images) {
    await convertFile(f, opts);
  }

  console.log('Done converting wrappers to webp.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

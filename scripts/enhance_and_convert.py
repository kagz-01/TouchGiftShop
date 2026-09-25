#!/usr/bin/env python3
"""
TouchGift — Image Enhancer & WebP Converter
============================================
Processes all images in `promohub-pictures/`:
  1. Sharpens the image
  2. Boosts contrast slightly
  3. Boosts colour vibrancy
  4. Saves as high-quality WebP to `public/products/`

Run from the project root:
  python3 scripts/enhance_and_convert.py
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageEnhance

# ── Config ──────────────────────────────────────────────────────────────
INPUT_DIR  = Path("promohub-pictures")
OUTPUT_DIR = Path("public/products")
QUALITY    = 88          # WebP quality (80-90 = sweet spot: small size, sharp look)
MAX_DIM    = 1600        # Max width or height — keeps originals that fit, resizes larger
SHARPEN    = 1.4         # Sharpness boost  (1.0 = original, 1.4 = noticeably crisper)
CONTRAST   = 1.08        # Contrast boost   (1.0 = original, 1.08 = subtle pop)
VIBRANCE   = 1.12        # Colour boost     (1.0 = original, 1.12 = richer tones)
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}

def enhance(img: Image.Image) -> Image.Image:
    """Apply sharpness, contrast and colour enhancement."""
    img = ImageEnhance.Sharpness(img).enhance(SHARPEN)
    img = ImageEnhance.Contrast(img).enhance(CONTRAST)
    img = ImageEnhance.Color(img).enhance(VIBRANCE)
    return img

def resize_if_needed(img: Image.Image) -> Image.Image:
    """Downscale only if either dimension exceeds MAX_DIM."""
    w, h = img.size
    if w > MAX_DIM or h > MAX_DIM:
        img.thumbnail((MAX_DIM, MAX_DIM), Image.LANCZOS)
    return img

def process_all():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    images = [p for p in INPUT_DIR.iterdir() if p.suffix.lower() in EXTENSIONS]
    total  = len(images)

    if total == 0:
        print(f"No images found in {INPUT_DIR}")
        sys.exit(1)

    print(f"Found {total} images — enhancing & converting to WebP ...\n")

    ok = skipped = errors = 0

    for i, src in enumerate(sorted(images), 1):
        dest = OUTPUT_DIR / (src.stem + ".webp")

        # Skip if already converted (re-run safety)
        if dest.exists():
            skipped += 1
            print(f"  [{i:>4}/{total}] SKIP  {src.name} — already exists")
            continue

        try:
            with Image.open(src) as img:
                img = img.convert("RGB")
                img = resize_if_needed(img)
                img = enhance(img)
                img.save(dest, "WEBP", quality=QUALITY, method=6)
            size_kb = dest.stat().st_size // 1024
            ok += 1
            print(f"  [{i:>4}/{total}] OK    {src.name}  ->  {dest.name}  ({size_kb} KB)")
        except Exception as e:
            errors += 1
            print(f"  [{i:>4}/{total}] ERROR {src.name}  ->  {e}")

    print(f"\n{'─'*55}")
    print(f"  Done!  {ok} converted  |  {skipped} skipped  |  {errors} errors")
    print(f"  Output: {OUTPUT_DIR.resolve()}")

if __name__ == "__main__":
    process_all()

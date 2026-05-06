import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = path.resolve(process.cwd());
const inputRoot = path.join(projectRoot, 'img', '_originali');
const outputRoot = path.join(projectRoot, 'img');

const allowedExts = new Set(['.jpg', '.jpeg', '.png']);
const widths = [480, 800, 1200, 1600];
const maxWidth = Math.max(...widths);

/**
 * Output files live next to the original, with suffix "-w{width}".
 * Example: "img/foo bar.jpg" -> "img/foo bar-w800.webp"
 */
async function buildVariantsForFile(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  if (!allowedExts.has(ext)) return;

  // Avoid processing generated responsive variants (e.g. *-w800.jpg),
  // otherwise we end up generating variants-of-variants.
  const baseNameNoExt = path.basename(absPath, ext);
  if (/-w\d+$/.test(baseNameNoExt)) return;

  const relFromInput = path.relative(inputRoot, absPath);
  const relNoExt = relFromInput.slice(0, -ext.length);
  const outBaseNoExt = path.join(outputRoot, relNoExt);
  const srcStat = await fs.stat(absPath);

  const img = sharp(absPath, { failOn: 'none' });
  const meta = await img.metadata();
  if (!meta.width) return;

  // Only generate up to our max breakpoint; avoid generating "full original width"
  // (e.g. 6000px) variants that are rarely needed and slow to encode.
  const uniqueWidths = widths
    .filter((w) => w <= meta.width && w <= maxWidth)
    .sort((a, b) => a - b);

  for (const w of uniqueWidths) {
    const resized = sharp(absPath, { failOn: 'none' }).resize({
      width: w,
      withoutEnlargement: true,
    });

    const outJpg = `${outBaseNoExt}-w${w}.jpg`;
    const outWebp = `${outBaseNoExt}-w${w}.webp`;
    const outAvif = `${outBaseNoExt}-w${w}.avif`;

    await fs.mkdir(path.dirname(outJpg), { recursive: true });

    // JPEG (fallback)
    await writeIfStale(outJpg, srcStat.mtimeMs, async () => {
      await resized
        .clone()
        .jpeg({
          quality: 80,
          progressive: true,
          mozjpeg: true,
        })
        .toFile(outJpg);
    });

    // WebP (default modern)
    await writeIfStale(outWebp, srcStat.mtimeMs, async () => {
      await resized
        .clone()
        .webp({
          quality: 76,
          effort: 5,
        })
        .toFile(outWebp);
    });

    // AVIF (best compression, slower to encode)
    await writeIfStale(outAvif, srcStat.mtimeMs, async () => {
      await resized
        .clone()
        .avif({
          quality: 45,
          effort: 4,
        })
        .toFile(outAvif);
    });
  }
}

async function writeIfStale(outPath, srcMtimeMs, writer) {
  try {
    const st = await fs.stat(outPath);
    if (st.mtimeMs >= srcMtimeMs) return;
  } catch {
    // missing -> generate
  }
  await writer();
}

async function walk(dirAbs) {
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  for (const e of entries) {
    const abs = path.join(dirAbs, e.name);
    if (e.isDirectory()) {
      await walk(abs);
    } else {
      await buildVariantsForFile(abs);
    }
  }
}

async function main() {
  try {
    await fs.access(inputRoot);
  } catch {
    console.error(`Missing folder: ${path.relative(projectRoot, inputRoot)}`);
    process.exitCode = 1;
    return;
  }

  await walk(inputRoot);
  console.log('Image variants generated.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


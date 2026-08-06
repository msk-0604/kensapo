import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCES = [
  path.join(ROOT, "scripts", "logo-original.jpg"),
  path.join(ROOT, "scripts", "logo-source.png"),
  path.join(ROOT, "app", "icon.png"),
];

/** 白背景向け: 黒→白、白アイコン→紺。青枠・緑チェックは残す */
async function toLightBackground(logoPng) {
  const { data, info } = await sharp(logoPng)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // 黒〜暗い背景 → 白
    if (r < 45 && g < 45 && b < 45) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      continue;
    }

    // 白〜明るいアイコン（ヘルメット・カレンダー）→ 紺
    if (r > 200 && g > 200 && b > 200) {
      data[i] = 26;
      data[i + 1] = 39;
      data[i + 2] = 68;
      continue;
    }

    // 青枠・緑チェックはそのまま
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .png()
    .toBuffer();
}

async function extractIconFromSource(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let textStartY = info.height;
  for (let y = Math.floor(info.height * 0.42); y < info.height; y++) {
    let bright = 0;
    for (
      let x = Math.floor(info.width * 0.18);
      x < Math.floor(info.width * 0.82);
      x++
    ) {
      const i = (y * info.width + x) * info.channels;
      if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) {
        bright++;
      }
    }
    if (bright > 40) {
      textStartY = y;
      break;
    }
  }

  let minX = info.width;
  let maxX = 0;
  let minY = info.height;
  let maxY = 0;

  for (let y = 0; y < textStartY - 8; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r < 20 && g < 20 && b < 20) continue;
      if (r > 245 && g > 245 && b > 245) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const side = Math.round(Math.max(width, height) * 1.05);
  const centerX = Math.round((minX + maxX) / 2);
  const centerY = Math.round((minY + maxY) / 2);
  const left = Math.max(0, centerX - Math.floor(side / 2));
  const top = Math.max(0, centerY - Math.floor(side / 2));

  return sharp(input)
    .extract({
      left,
      top,
      width: Math.min(side, info.width - left),
      height: Math.min(side, info.height - top),
    })
    .png()
    .toBuffer();
}

async function buildSquareIcon(size, logo) {
  return sharp(logo)
    .resize(size, size, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();
}

async function main() {
  // 元ロゴは黒背景版を優先（色変換の元になる）
  const input = [
    path.join(ROOT, "scripts", "logo-original.jpg"),
    path.join(ROOT, "scripts", "logo-source.png"),
  ].find((candidate) => fs.existsSync(candidate));
  if (!input) {
    throw new Error("Icon source image not found.");
  }

  const cropped = await extractIconFromSource(input);
  const logo = await toLightBackground(cropped);
  fs.mkdirSync(path.join(ROOT, "scripts"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "scripts", "logo-source.png"), logo);

  const icon512 = await buildSquareIcon(512, logo);
  const icon180 = await buildSquareIcon(180, logo);
  const sizes = [16, 32, 48, 64, 128, 256];

  fs.writeFileSync(path.join(ROOT, "app", "icon.png"), icon512);
  fs.writeFileSync(path.join(ROOT, "app", "apple-icon.png"), icon180);

  const pngPaths = [];
  const tmpDir = path.join(ROOT, ".tmp-icons");
  fs.mkdirSync(tmpDir, { recursive: true });
  for (const size of sizes) {
    const filePath = path.join(tmpDir, `${size}.png`);
    fs.writeFileSync(filePath, await buildSquareIcon(size, logo));
    pngPaths.push(filePath);
  }

  const ico = await pngToIco(pngPaths);
  fs.writeFileSync(path.join(ROOT, "app", "favicon.ico"), ico);
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log("icon.png", fs.statSync(path.join(ROOT, "app", "icon.png")).size);
  console.log(
    "favicon.ico",
    fs.statSync(path.join(ROOT, "app", "favicon.ico")).size
  );
  console.log("background: white / icon: navy");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

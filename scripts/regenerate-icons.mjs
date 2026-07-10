import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCES = [
  path.join(ROOT, "scripts", "logo-source.png"),
  path.join(
    ROOT,
    "..",
    ".cursor",
    "projects",
    "c-dev-kensapo",
    "assets",
    "c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_8ebe11fb22a31732e10e5fbe8c9536c7_images_image-6982890e-10b5-4924-8850-a9bf62b93c75.png"
  ),
  path.join(
    ROOT,
    "..",
    ".cursor",
    "projects",
    "c-dev-kensapo",
    "assets",
    "c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_8ebe11fb22a31732e10e5fbe8c9536c7_images_image-6a6a0d22-e51b-4ac5-8757-a75e13faa281.png"
  ),
  path.join(ROOT, "app", "icon.png"),
];

async function extractIconFromSource(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let textStartY = info.height;
  for (let y = Math.floor(info.height * 0.42); y < info.height; y++) {
    let bright = 0;
    for (let x = Math.floor(info.width * 0.18); x < Math.floor(info.width * 0.82); x++) {
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
  const side = Math.round(Math.max(width, height) * 1.12);
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
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .png()
    .toBuffer();
}

async function main() {
  const input = SOURCES.find((candidate) => fs.existsSync(candidate));
  if (!input) {
    throw new Error("Icon source image not found.");
  }

  const logo = await extractIconFromSource(input);
  fs.mkdirSync(path.join(ROOT, "scripts"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "scripts", "logo-source.png"), logo);

  const icon512 = await buildSquareIcon(512, logo);
  const icon180 = await buildSquareIcon(180, logo);

  fs.writeFileSync(path.join(ROOT, "app", "icon.png"), icon512);
  fs.writeFileSync(path.join(ROOT, "app", "apple-icon.png"), icon180);

  const sizes = [16, 32, 48, 64, 128, 256];
  const tmpDir = path.join(ROOT, ".tmp-icons");
  fs.mkdirSync(tmpDir, { recursive: true });
  const pngPaths = [];
  for (const size of sizes) {
    const filePath = path.join(tmpDir, `${size}.png`);
    fs.writeFileSync(filePath, await buildSquareIcon(size, logo));
    pngPaths.push(filePath);
  }

  fs.writeFileSync(path.join(ROOT, "app", "favicon.ico"), await pngToIco(pngPaths));
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log("Icons regenerated from latest logo source.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

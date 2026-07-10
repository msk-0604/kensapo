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
    "c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_8ebe11fb22a31732e10e5fbe8c9536c7_images_image-6a6a0d22-e51b-4ac5-8757-a75e13faa281.png"
  ),
  path.join(ROOT, "app", "icon.png"),
];
const BLUE = { r: 1, g: 68, b: 188 };

async function loadLogoBuffer() {
  const input = SOURCES.find((candidate) => fs.existsSync(candidate));
  if (!input) {
    throw new Error("Icon source image not found.");
  }
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r > 235 && g > 235 && b > 235) {
      pixels[i + 3] = 0;
    }
  }

  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim()
    .png()
    .toBuffer();
}

async function buildSquareIcon(size, logo) {
  const logoSize = Math.round(size * 0.88);
  const resizedLogo = await sharp(logo)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: BLUE,
    },
  })
    .composite([{ input: resizedLogo, gravity: "center" }])
    .png()
    .toBuffer();
}

async function main() {
  const logo = await loadLogoBuffer();
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

  console.log("Icons regenerated with full-bleed blue background.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

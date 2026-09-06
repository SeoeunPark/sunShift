import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const iconsDir = join(rootDir, "public", "icons");
const sourcePath = join(iconsDir, "source-app-icon.png");
const faviconSourcePath = join(iconsDir, "source-favicon.png");
const svgPath = join(iconsDir, "icon.svg");

mkdirSync(iconsDir, { recursive: true });

const resolveSource = (path, fallback) => {
  try {
    readFileSync(path);
    return path;
  } catch {
    return fallback;
  }
};

const appInput = resolveSource(sourcePath, svgPath);
const faviconInput = resolveSource(faviconSourcePath, appInput);

const appSizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of appSizes) {
  await sharp(appInput).resize(size, size).png().toFile(join(iconsDir, name));
  console.log(`Generated ${name}`);
}

await sharp(faviconInput).resize(32, 32).png().toFile(join(iconsDir, "favicon-32.png"));
console.log("Generated favicon-32.png");

const favicon = await sharp(faviconInput).resize(32, 32).png().toBuffer();
writeFileSync(join(rootDir, "public", "favicon.ico"), favicon);
console.log("Generated favicon.ico");

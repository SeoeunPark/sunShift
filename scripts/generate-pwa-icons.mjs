import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const iconsDir = join(rootDir, "public", "icons");
const svgPath = join(iconsDir, "icon.svg");
const svg = readFileSync(svgPath);

mkdirSync(iconsDir, { recursive: true });

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon-32.png", size: 32 },
];

for (const { name, size } of sizes) {
  await sharp(svg).resize(size, size).png().toFile(join(iconsDir, name));
  console.log(`Generated ${name}`);
}

const favicon = await sharp(svg).resize(32, 32).png().toBuffer();
writeFileSync(join(rootDir, "public", "favicon.ico"), favicon);
console.log("Generated favicon.ico");

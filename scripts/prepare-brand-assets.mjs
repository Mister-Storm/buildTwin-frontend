#!/usr/bin/env node
/**
 * Builds brand assets from buildTwin.png (Downloads).
 * - Detects 2x2 concept sheet and extracts "Tipografia Inteligente" (bottom-right)
 * - Removes white/light-grey background → transparent PNG (original brand colors)
 *
 * Usage: npm run prepare:brand
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const source =
  process.env.BUILDTWIN_LOGO_SOURCE ??
  path.join(os.homedir(), "Downloads", "buildTwin.png");
const brandDir = path.join(root, "public", "brand");
const demoDir = path.join(root, "public", "demo");
const appIcon = path.join(root, "src", "app", "icon.png");

if (!fs.existsSync(source)) {
  console.error(`Logo source not found: ${source}`);
  console.error("Set BUILDTWIN_LOGO_SOURCE to the buildTwin.png path.");
  process.exit(1);
}

const pyScript = `
from PIL import Image, ImageDraw
import os

source = ${JSON.stringify(source)}
brand_dir = ${JSON.stringify(brandDir)}
demo_dir = ${JSON.stringify(demoDir)}
app_icon = ${JSON.stringify(appIcon)}

os.makedirs(brand_dir, exist_ok=True)
os.makedirs(demo_dir, exist_ok=True)

def remove_light_background(img, white_threshold=240, grey_threshold=210):
    """Turn white / light-grey panel background and soft shadows transparent."""
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a < 10:
                continue
            spread = max(r, g, b) - min(r, g, b)
            avg = (r + g + b) / 3
            # near-white background
            if r >= white_threshold and g >= white_threshold and b >= white_threshold:
                pixels[x, y] = (r, g, b, 0)
            # light grey panel + diagonal shadow (low saturation, high luminance)
            elif spread < 28 and avg >= grey_threshold:
                pixels[x, y] = (r, g, b, 0)
    return img

def trim_transparent(img):
    bbox = img.getbbox()
    return img.crop(bbox) if bbox else img

def extract_logo(raw):
    w, h = raw.size
    # 2x2 concept sheet from buildTwin.png
    if w >= 2000 and h >= 1000 and abs(w / h - 16 / 9) < 0.2:
        quadrant = raw.crop((w // 2, h // 2, w, h))
        # Drop concept-sheet title ("A TIPOGRAFIA INTELIGENTE") — keep wordmark only
        qw, qh = quadrant.size
        return quadrant.crop((0, int(qh * 0.18), qw, qh))
    return raw

raw = Image.open(source).convert("RGBA")
logo = extract_logo(raw)
logo = remove_light_background(logo)
logo = trim_transparent(logo)

# Full-resolution transparent logo (original colors)
logo.save(os.path.join(brand_dir, "logo.png"))

# Sidebar size
sidebar = logo.copy()
ratio = 200 / sidebar.width
sidebar = sidebar.resize((200, max(1, int(sidebar.height * ratio))), Image.Resampling.LANCZOS)
sidebar.save(os.path.join(brand_dir, "logo-sidebar.png"))

# Favicon: pin + signal from typography logo (right side)
lw, lh = logo.size
pin = logo.crop((int(lw * 0.52), 0, lw, int(lh * 0.72)))
pin = trim_transparent(pin)
icon_size = max(pin.width, pin.height, 1)
icon = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
offset = ((icon_size - pin.width) // 2, (icon_size - pin.height) // 2)
icon.paste(pin, offset, pin)
icon = icon.resize((512, 512), Image.Resampling.LANCZOS)
icon.save(os.path.join(brand_dir, "icon.png"))
icon.save(app_icon)

# Demo orthomosaic placeholder
demo = Image.new("RGB", (1600, 900), (180, 170, 150))
draw = ImageDraw.Draw(demo)
for y in range(0, 900, 40):
    shade = 150 + (y % 80)
    draw.line([(0, y), (1600, y)], fill=(shade, shade - 20, shade - 40))
for x in range(0, 1600, 60):
    draw.line([(x, 0), (x, 900)], fill=(120, 110, 95))
draw.rectangle([650, 300, 950, 650], fill=(90, 100, 110), outline=(60, 60, 70), width=3)
draw.rectangle([720, 350, 880, 650], fill=(110, 120, 130))
demo.save(os.path.join(demo_dir, "orthomosaic-preview.jpg"), quality=85)

print("Logo exported with transparent background → public/brand/logo.png")
`;

const tmpPy = path.join(root, ".tmp-prepare-brand.py");
fs.writeFileSync(tmpPy, pyScript);
try {
  execSync(`python3 "${tmpPy}"`, { stdio: "inherit" });
} finally {
  fs.unlinkSync(tmpPy);
}

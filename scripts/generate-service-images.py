"""
generate-service-images.py
Creates placeholder JPEG images for each service under:
  public/assets/images/services/{category_service_name_1.jpeg}
Run from project root: python3 scripts/generate-service-images.py
"""

import json, os, re
from PIL import Image, ImageDraw, ImageFont

# Category → background color (accent palette)
CATEGORY_COLORS = {
    "Hair Cut":            ("#6B4F3A", "#F5EDE6"),
    "Chemical Service":    ("#3A5A6B", "#E6F0F5"),
    "Hair Treatment":      ("#4A6B3A", "#EBF5E6"),
    "Extensions":          ("#6B3A5A", "#F5E6F0"),
    "Braids":              ("#5A6B3A", "#F0F5E6"),
    "Locs":                ("#6B5A3A", "#F5F0E6"),
    "Natural Hair Styles": ("#3A4A6B", "#E6EBF5"),
    "Bridal":              ("#8B6F5E", "#FBF7F4"),
    "Add On":              ("#4A4A4A", "#F0F0F0"),
}

def slugify(text):
    return re.sub(r'[^a-z0-9]+', '_', text.lower()).strip('_')

def make_placeholder(name, category, out_path):
    bg_color, text_color = CATEGORY_COLORS.get(category, ("#888888", "#FFFFFF"))
    img = Image.new("RGB", (800, 600), bg_color)
    draw = ImageDraw.Draw(img)

    # Subtle grid overlay
    for x in range(0, 800, 40):
        draw.line([(x, 0), (x, 600)], fill=text_color + "22" if len(text_color) == 7 else text_color, width=1)
    for y in range(0, 600, 40):
        draw.line([(0, y), (800, y)], fill=text_color + "22" if len(text_color) == 7 else text_color, width=1)

    # Try to load a font, fall back to default
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 42)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    except Exception:
        font_large = ImageFont.load_default()
        font_small = font_large

    # Category label
    draw.text((400, 220), category.upper(), fill=text_color, font=font_small, anchor="mm")
    # Service name
    draw.text((400, 300), name, fill=text_color, font=font_large, anchor="mm")
    # Placeholder label
    draw.text((400, 380), "[ placeholder ]", fill=text_color, font=font_small, anchor="mm")

    img.save(out_path, "JPEG", quality=85)

# ── Main ─────────────────────────────────────────────────────────────────────
services_path = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "data", "services.json"))
output_dir    = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "public", "assets", "images", "services"))
os.makedirs(output_dir, exist_ok=True)

with open(services_path) as f:
    services = json.load(f)

created = 0
for svc in services:
    cat  = slugify(svc["category"])
    name = slugify(svc["name"])
    filename = f"{cat}_{name}_1.jpeg"
    out_path = os.path.join(output_dir, filename)
    make_placeholder(svc["name"], svc["category"], out_path)
    print(f"  ✓ {filename}")
    created += 1

print(f"\n✅ {created} images written to {output_dir}")

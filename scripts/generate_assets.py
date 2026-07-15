"""
Generate placeholder assets for the Mindloop landing page.

Produces six 256x256 PNGs in /home/z/my-project/mindloop/public/assets/:
- avatar-1.png, avatar-2.png, avatar-3.png  (3 monochrome portrait silhouettes)
- icon-chatgpt.png                          (stylized "AI" knot mark)
- icon-perplexity.png                       (concentric ring mark)
- icon-google.png                           (4-color-less Google-G mark in white)
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math
import os

OUT_DIR = "/home/z/my-project/mindloop/public/assets"
os.makedirs(OUT_DIR, exist_ok=True)

# ---------- Avatars ----------
# Three different silhouettes on a dark grey circular background, all monochrome.

def make_avatar(path: str, seed: int) -> None:
    size = 256
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background circle — subtle monochrome gradient
    cx, cy = size // 2, size // 2
    r = size // 2
    for i in range(r, 0, -1):
        # Vary tone slightly per avatar to keep them distinguishable
        base = 22 + (seed * 6) + int(20 * (i / r))
        base = max(20, min(70, base))
        draw.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(base, base, base, 255))

    # Head
    head_r = int(r * 0.32)
    head_cy = int(cy - r * 0.18)
    head_tone = 200 - seed * 10
    draw.ellipse(
        [cx - head_r, head_cy - head_r, cx + head_r, head_cy + head_r],
        fill=(head_tone, head_tone, head_tone, 255),
    )

    # Shoulders / body
    body_r_x = int(r * 0.65)
    body_r_y = int(r * 0.50)
    body_cy = cy + int(r * 0.95)
    draw.ellipse(
        [cx - body_r_x, body_cy - body_r_y, cx + body_r_x, body_cy + body_r_y],
        fill=(head_tone, head_tone, head_tone, 255),
    )

    # Subtle vignette / noise to look like a real portrait
    img = img.filter(ImageFilter.GaussianBlur(radius=0.6))
    img.save(path, "PNG")
    print(f"Wrote {path}")


make_avatar(os.path.join(OUT_DIR, "avatar-1.png"), seed=0)
make_avatar(os.path.join(OUT_DIR, "avatar-2.png"), seed=1)
make_avatar(os.path.join(OUT_DIR, "avatar-3.png"), seed=2)


# ---------- Platform icons ----------
# All icons are 256x256, transparent background, pure white line-art,
# so they render correctly on the black cards.

def new_canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


WHITE = (255, 255, 255, 255)
GREY = (220, 220, 220, 255)


def make_chatgpt_icon(path: str) -> None:
    """Stylized OpenAI-like knot mark (simplified)."""
    img, d = new_canvas()
    cx, cy = 128, 128
    # Outer hexagonal-ish ring
    r = 70
    pts = []
    for i in range(6):
        ang = math.radians(60 * i - 30)
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    for i in range(6):
        a = pts[i]
        b = pts[(i + 1) % 6]
        d.line([a, b], fill=WHITE, width=6)
    # Inner overlapping triangles — abstract "knot" feel
    r2 = 38
    tri_a = [
        (cx + r2 * math.cos(math.radians(90 + k * 120)),
         cy + r2 * math.sin(math.radians(90 + k * 120)))
        for k in range(3)
    ]
    tri_b = [
        (cx + r2 * math.cos(math.radians(-90 + k * 120)),
         cy + r2 * math.sin(math.radians(-90 + k * 120)))
        for k in range(3)
    ]
    for tri in (tri_a, tri_b):
        for i in range(3):
            d.line([tri[i], tri[(i + 1) % 3]], fill=WHITE, width=6)
    # Center dot
    d.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=WHITE)
    img.save(path, "PNG")
    print(f"Wrote {path}")


def make_perplexity_icon(path: str) -> None:
    """Concentric rings + center tick mark (Perplexity-like)."""
    img, d = new_canvas()
    cx, cy = 128, 128
    for r, w in [(82, 5), (62, 5), (42, 5)]:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=WHITE, width=w)
    # Inner crosshair
    d.line([(cx, cy - 18), (cx, cy + 18)], fill=WHITE, width=5)
    d.line([(cx - 18, cy), (cx + 18, cy)], fill=WHITE, width=5)
    img.save(path, "PNG")
    print(f"Wrote {path}")


def make_google_icon(path: str) -> None:
    """Google-G mark in pure white (monochrome)."""
    img, d = new_canvas()
    cx, cy = 128, 128
    r = 78
    # 4-segment arc
    # We'll draw a full ring and then "cut" it by overdrawing a small white
    # gap, then add the horizontal stroke for the G's crossbar.
    bbox = [cx - r, cy - r, cx + r, cy + r]
    d.ellipse(bbox, outline=WHITE, width=14)
    # Cut a gap on the right side
    gap_start = math.radians(-25)
    gap_end = math.radians(25)
    steps = 60
    for i in range(steps + 1):
        t = gap_start + (gap_end - gap_start) * i / steps
        x = cx + (r - 1) * math.cos(t)
        y = cy + (r - 1) * math.sin(t)
        # erase along gap by drawing transparent
        d.ellipse([x - 12, y - 12, x + 12, y + 12], fill=(0, 0, 0, 0))
    # Re-blit with proper alpha erase by pasting a transparent disk — simpler:
    # Instead, mask out the gap by drawing the arc open.
    # Easier: redraw image cleanly with arc().
    img, d = new_canvas()
    # 4 colored-arcs of the Google G, but in monochrome — just one white arc.
    # Top arc
    d.arc(bbox, start=200, end=340, fill=WHITE, width=14)
    # Bottom-right arc
    d.arc(bbox, start=-35, end=35, fill=WHITE, width=14)
    # Bottom-left arc
    d.arc(bbox, start=40, end=140, fill=WHITE, width=14)
    # Top-left arc
    d.arc(bbox, start=150, end=200, fill=WHITE, width=14)
    # Crossbar
    d.line([(cx, cy), (cx + r - 4, cy)], fill=WHITE, width=14)
    img.save(path, "PNG")
    print(f"Wrote {path}")


make_chatgpt_icon(os.path.join(OUT_DIR, "icon-chatgpt.png"))
make_perplexity_icon(os.path.join(OUT_DIR, "icon-perplexity.png"))
make_google_icon(os.path.join(OUT_DIR, "icon-google.png"))

print("\nAll assets written to", OUT_DIR)

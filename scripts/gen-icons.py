#!/usr/bin/env python3
"""iOS app icon (1024x1024): a tennis racquet with a gold string bed on the
StringLog dark tile. Minimal flat pictogram, generous margins so it stays
legible at home-screen size.

Run from repo root:  python3 scripts/gen-icons.py
Writes ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png

Apple applies the rounded-square mask and rejects alpha channels, so this
draws full-bleed on a solid dark tile and saves as RGB (no alpha).
StringLog palette:
  tile    #0a0a0a   near-black background
  gold    #e2c07a   racquet + strings
"""
import os
from PIL import Image, ImageDraw, ImageChops

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICON = os.path.join(REPO,
    "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png")

S = 1024
BG = (0x0a, 0x0a, 0x0a)
GOLD = (0xe2, 0xc0, 0x7a)


def main():
    img = Image.new("RGB", (S, S), BG)
    d = ImageDraw.Draw(img)
    cx = S / 2.0

    head_cx, head_cy = cx, S * 0.395
    rx, ry = S * 0.250, S * 0.298
    rim_w = max(8, int(S * 0.024))
    sw = max(4, int(S * 0.011))   # string width

    # String bed: draw the grid on its own layer, then keep only the part
    # that falls inside the (inset) head ellipse via an AND of the masks.
    strings = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sd = ImageDraw.Draw(strings)
    n_v, n_h = 6, 7
    for i in range(1, n_v):
        x = head_cx - rx + (2 * rx) * i / n_v
        sd.line([(x, head_cy - ry), (x, head_cy + ry)], fill=GOLD + (255,), width=sw)
    for j in range(1, n_h):
        y = head_cy - ry + (2 * ry) * j / n_h
        sd.line([(head_cx - rx, y), (head_cx + rx, y)], fill=GOLD + (255,), width=sw)

    inset = S * 0.030
    ell = Image.new("L", (S, S), 0)
    ImageDraw.Draw(ell).ellipse(
        [head_cx - rx + inset, head_cy - ry + inset,
         head_cx + rx - inset, head_cy + ry - inset], fill=255)
    combined = ImageChops.multiply(strings.split()[3], ell)
    img.paste(GOLD, (0, 0), combined)

    # Head rim
    d.ellipse([head_cx - rx, head_cy - ry, head_cx + rx, head_cy + ry], outline=GOLD, width=rim_w)

    # Throat (two converging shafts) + grip handle
    neck_y = head_cy + ry - rim_w * 0.4
    handle_top = S * 0.735
    handle_bottom = S * 0.862
    hw = S * 0.072
    d.line([(head_cx - rx * 0.52, neck_y), (head_cx - hw / 2, handle_top)], fill=GOLD, width=rim_w)
    d.line([(head_cx + rx * 0.52, neck_y), (head_cx + hw / 2, handle_top)], fill=GOLD, width=rim_w)
    d.rounded_rectangle([head_cx - hw / 2, handle_top, head_cx + hw / 2, handle_bottom],
                        radius=hw * 0.4, fill=GOLD)

    os.makedirs(os.path.dirname(ICON), exist_ok=True)
    img.convert("RGB").save(ICON, "PNG", optimize=True)
    print("wrote", ICON)


if __name__ == "__main__":
    main()

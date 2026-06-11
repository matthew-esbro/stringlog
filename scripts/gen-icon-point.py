#!/usr/bin/env python3
"""App-icon concept: a single bold backgammon 'point' (triangle) with a
clean stack of checkers resting on it. Minimal flat pictogram, generous
margins, designed to stay legible at home-screen size.

Renders 6 palettes to /tmp/icon_point_v{n}_full.png (1024x1024) plus a
review contact sheet /tmp/icon_point_sheet.png that shows each one masked
to the iOS rounded-square AND at 48/72/120px to prove small-size legibility.

Run from repo root:  python3 scripts/gen-icon-point.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

S = 1024
SCRIPTDIR = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(SCRIPTDIR, "InstrumentSerif-Regular.ttf")

# name: (BG, TRIANGLE, CHECKER_FILL, CHECKER_RIM)
PALETTES = [
    ("Ivory Classic",  ((0xf0,0xe8,0xd0),(0x6e,0x3f,0x1c),(0xf6,0xe4,0xb0),(0x6e,0x3f,0x1c))),
    ("Walnut Caramel", ((0xc9,0x8a,0x3e),(0x49,0x27,0x11),(0xfa,0xf2,0xde),(0x49,0x27,0x11))),
    ("Crimson",        ((0xf4,0xea,0xd0),(0x8a,0x2a,0x22),(0xf8,0xee,0xd8),(0x6e,0x1c,0x16))),
    ("Navy & Cream",   ((0xec,0xe6,0xd4),(0x1d,0x3a,0x6e),(0xf6,0xf2,0xe6),(0x14,0x28,0x4e))),
    ("Emerald",        ((0xee,0xea,0xd6),(0x1c,0x54,0x36),(0xf6,0xf2,0xde),(0x12,0x3a,0x26))),
    ("Duotone Dark",   ((0x24,0x16,0x0e),(0xe8,0xd2,0x9c),(0xf4,0xe6,0xbe),(0x3a,0x22,0x12))),
]


def render(pal):
    BG, TRI, CF, CR = pal
    img = Image.new("RGB", (S, S), BG)
    d = ImageDraw.Draw(img)
    cx = S/2.0
    # Squat, wide "point" (pennant, not pine tree)
    half = S*0.258
    base_y = S*0.762
    apex_y = S*0.252
    d.polygon([(cx-half, base_y), (cx+half, base_y), (cx, apex_y)], fill=TRI)
    # Chunky side-on chip stack: overlapping flat discs read as
    # stacked game pieces and hold up at 48px.
    rw = S*0.142
    rh = S*0.056
    step = rh*1.34
    n = 3
    ow = max(3, int(rh*0.17))
    bottom = base_y - rh*1.15
    for k in range(n):
        cy = bottom - k*step
        d.ellipse([cx-rw, cy-rh, cx+rw, cy+rh], fill=CF)
        d.ellipse([cx-rw, cy-rh, cx+rw, cy+rh], outline=CR, width=ow)
    ty = bottom - (n-1)*step
    hl = tuple(min(255, c+22) for c in CF)
    d.ellipse([cx-rw*0.52, ty-rh*0.46, cx+rw*0.52, ty+rh*0.16], fill=hl)
    return img


def rounded(img, size, radius_frac=0.22):
    t = img.resize((size, size), Image.LANCZOS)
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle(
        [0, 0, size, size], radius=int(size*radius_frac), fill=255)
    return t, m


def main():
    rendered = []
    for n, (name, pal) in enumerate(PALETTES, 1):
        img = render(pal)
        p = f"/tmp/icon_point_v{n}_full.png"
        img.save(p, "PNG")
        rendered.append((name, img))
        print(f"v{n}: {name} -> {p}")

    cols, rows = 3, 2
    cell_w, cell_h, pad = 420, 560, 30
    sheet_w = cols*cell_w + pad*(cols+1)
    sheet_h = rows*cell_h + pad*(rows+1)
    sheet = Image.new("RGB", (sheet_w, sheet_h), (0x88, 0x88, 0x88))
    sd = ImageDraw.Draw(sheet)
    try:
        f = ImageFont.truetype(FONT, 32)
    except Exception:
        f = ImageFont.load_default()

    big = 340
    for i, (name, img) in enumerate(rendered):
        c, rrow = i % cols, i // cols
        x0 = pad + c*(cell_w+pad)
        y0 = pad + rrow*(cell_h+pad)
        t, m = rounded(img, big)
        sheet.paste(t, (x0+(cell_w-big)//2, y0), m)
        sd.text((x0+cell_w//2, y0+big+14),
                f"v{i+1}   {name}", font=f, fill=(15, 15, 15), anchor="ma")
        my = y0+big+64
        slot = 140
        gx = x0 + (cell_w - slot*3)//2
        for j, msz in enumerate((48, 72, 120)):
            mt, mm = rounded(img, msz)
            sheet.paste(mt, (gx+j*slot+(slot-msz)//2, my+(130-msz)//2), mm)
    sheet.save("/tmp/icon_point_sheet.png", "PNG")
    print("sheet -> /tmp/icon_point_sheet.png")


if __name__ == "__main__":
    main()

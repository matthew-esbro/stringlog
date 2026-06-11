#!/usr/bin/env python3
"""Render the backgammon-board app icon in 6 vibrant palettes for review.
Outputs /tmp/icon_v1.png .. icon_v6.png (downscaled previews) and the
full-res 1024 versions to /tmp/icon_v{n}_full.png so a chosen one can be
copied straight into the AppIcon slot.
"""
import os
from PIL import Image, ImageDraw

S = 1024

PALETTES = [
    ("Crimson Classic", dict(
        CANVAS=(0xf4,0xea,0xd0), BORD=(0x8a,0x2a,0x22), BG=(0xb2,0x3a,0x2e),
        PT_D=(0x7a,0x1f,0x18), PT_L=(0xf0,0xdc,0xae), BAR=(0x7a,0x1f,0x18),
        PCK=(0xfa,0xf4,0xe0), PCB=(0xc8,0xa8,0x70), CCK=(0x2a,0x14,0x10), CCB=(0x18,0x0a,0x06))),
    ("Emerald", dict(
        CANVAS=(0xee,0xf0,0xe0), BORD=(0x1f,0x5c,0x3a), BG=(0x2e,0x8b,0x57),
        PT_D=(0x1c,0x54,0x36), PT_L=(0xe8,0xe4,0xbc), BAR=(0x1c,0x54,0x36),
        PCK=(0xfa,0xfa,0xe8), PCB=(0xb8,0xc0,0x90), CCK=(0x14,0x24,0x1a), CCB=(0x0a,0x14,0x0e))),
    ("Royal Blue", dict(
        CANVAS=(0xe8,0xec,0xf4), BORD=(0x1f,0x3a,0x6e), BG=(0x2f,0x5f,0xae),
        PT_D=(0x1d,0x3a,0x72), PT_L=(0xe6,0xdc,0xae), BAR=(0x1d,0x3a,0x72),
        PCK=(0xfa,0xfa,0xf0), PCB=(0xb0,0xb8,0xc8), CCK=(0x14,0x18,0x2a), CCB=(0x0a,0x0e,0x18))),
    ("Teal Modern", dict(
        CANVAS=(0xe6,0xf0,0xee), BORD=(0x16,0x6b,0x66), BG=(0x1f,0x9b,0x91),
        PT_D=(0x14,0x5f,0x59), PT_L=(0xf0,0xe2,0xc0), BAR=(0x14,0x5f,0x59),
        PCK=(0xfd,0xfb,0xf0), PCB=(0xa8,0xc4,0xc0), CCK=(0x0e,0x2a,0x28), CCB=(0x06,0x18,0x16))),
    ("Burgundy & Gold", dict(
        CANVAS=(0xf2,0xe8,0xd8), BORD=(0x6e,0x22,0x38), BG=(0x8a,0x2f,0x4a),
        PT_D=(0x5e,0x1f,0x33), PT_L=(0xe8,0xc8,0x78), BAR=(0x5e,0x1f,0x33),
        PCK=(0xf8,0xef,0xd6), PCB=(0xc8,0xa0,0x68), CCK=(0x2a,0x10,0x18), CCB=(0x18,0x08,0x0e))),
    ("Amber Wood", dict(
        CANVAS=(0xf8,0xef,0xd0), BORD=(0x9a,0x5a,0x1e), BG=(0xd4,0x89,0x2e),
        PT_D=(0x8a,0x4a,0x18), PT_L=(0xf4,0xe0,0xa8), BAR=(0x8a,0x4a,0x18),
        PCK=(0xff,0xfa,0xf0), PCB=(0xc8,0xa8,0x70), CCK=(0x3a,0x1e,0x08), CCB=(0x22,0x12,0x06))),
]


def checker(d, cx, cy, rad, fill, border):
    d.ellipse([cx-rad,cy-rad,cx+rad,cy+rad], fill=border)
    ins=max(1,int(rad*0.16))
    d.ellipse([cx-rad+ins,cy-rad+ins,cx+rad-ins,cy+rad-ins], fill=fill)
    hr=int(rad*0.42); hx,hy=cx-int(rad*0.22),cy-int(rad*0.22)
    hl=tuple(min(255,c+30) for c in fill)
    d.ellipse([hx-hr,hy-hr,hx+hr,hy+hr], fill=hl)


def draw_board(p):
    img=Image.new("RGB",(S,S),p["CANVAS"]); d=ImageDraw.Draw(img)
    M=70; bx0,by0,bx1,by1=M,M,S-M,S-M
    d.rounded_rectangle([bx0,by0,bx1,by1],radius=46,fill=p["BORD"])
    fw=30; ix0,iy0,ix1,iy1=bx0+fw,by0+fw,bx1-fw,by1-fw
    d.rounded_rectangle([ix0,iy0,ix1,iy1],radius=22,fill=p["BG"])
    iW=ix1-ix0; iH=iy1-iy0
    barW=int(iW*0.085); barX0=ix0+(iW-barW)//2; barX1=barX0+barW
    sideW=(iW-barW)/2.0; colW=sideW/6.0; triH=iH*0.40
    def cL(i): return ix0+i*colW
    def cR(i): return barX1+i*colW
    for half,base in (("L",cL),("R",cR)):
        for i in range(6):
            x0=base(i); x1=x0+colW; xm=(x0+x1)/2.0
            idx=i if half=="L" else i+6
            top=p["PT_D"] if idx%2==0 else p["PT_L"]
            bot=p["PT_L"] if idx%2==0 else p["PT_D"]
            d.polygon([(x0,iy0),(x1,iy0),(xm,iy0+triH)],fill=top)
            d.polygon([(x0,iy1),(x1,iy1),(xm,iy1-triH)],fill=bot)
    d.rectangle([barX0,iy0,barX1,iy1],fill=p["BAR"])
    cr=colW*0.40; sp=cr*1.5
    def stack(cx,ty,n,f,b,down):
        for k in range(n):
            cy=ty+(k*sp if down else -k*sp); checker(d,cx,cy,cr,f,b)
    stack(cL(0)+colW/2, iy1-cr-6, 5, p["PCK"],p["PCB"], False)
    stack(cR(5)+colW/2, iy1-cr-6, 5, p["CCK"],p["CCB"], False)
    stack(cL(4)+colW/2, iy0+cr+6, 3, p["CCK"],p["CCB"], True)
    stack(cR(1)+colW/2, iy0+cr+6, 3, p["PCK"],p["PCB"], True)
    return img


def main():
    for n,(name,pal) in enumerate(PALETTES,1):
        img=draw_board(pal)
        img.save(f"/tmp/icon_v{n}_full.png","PNG")
        prev=img.copy(); prev.thumbnail((520,520))
        prev.save(f"/tmp/icon_v{n}.png","PNG")
        print(f"v{n}: {name}")


if __name__=="__main__":
    main()

#!/usr/bin/env python3
"""Generate web icons and the Open Graph preview image for the Pages site,
derived from the iOS app icon. Output goes to www/icons/."""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png')
FONT = os.path.join(ROOT, 'scripts/InstrumentSerif-Regular.ttf')
OUT = os.path.join(ROOT, 'www/icons')
os.makedirs(OUT, exist_ok=True)

BG, GOLD, DIM = '#0a0a0a', '#e2c07a', '#9a9a9a'

icon = Image.open(SRC).convert('RGB')
for name, size in [('favicon-32.png', 32), ('apple-touch-icon.png', 180),
                   ('icon-192.png', 192), ('icon-512.png', 512)]:
    icon.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, name))

# Open Graph card: 1200x630, icon left, wordmark right
og = Image.new('RGB', (1200, 630), BG)
d = ImageDraw.Draw(og)
ic = icon.resize((260, 260), Image.LANCZOS)
mask = Image.new('L', (260, 260), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, 260, 260], radius=58, fill=255)
og.paste(ic, (110, 185), mask)
title = ImageFont.truetype(FONT, 132)
sub = ImageFont.truetype(FONT, 46)
d.text((430, 205), 'StringLog', font=title, fill=GOLD)
d.text((436, 370), 'Tennis string tracker', font=sub, fill=DIM)
d.rectangle([0, 620, 1200, 630], fill=GOLD)
og.save(os.path.join(OUT, 'og-image.png'))
print('wrote', OUT)

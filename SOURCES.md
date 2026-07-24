# Device spec sources

Physical resolution and PPI values in `public/app.js` come from the
manufacturers' published specifications, verified July 2026. CSS viewport
and DPR are not published by manufacturers — they are well-established
browser values (viewport ≈ physical resolution ÷ DPR), cross-checked
against viewport databases (blisk.io, yesviz.com).

## Apple (support.apple.com tech specs pages)

| Device | Resolution | PPI | Source |
|---|---|---|---|
| iPhone SE (3rd gen) | 750×1334 | 326 | https://support.apple.com/en-us/111866 |
| iPhone 11 | 828×1792 | 326 | https://support.apple.com/en-us/111865 |
| iPhone 13 mini | 1080×2340 | 476 | https://support.apple.com/en-us/111873 |
| iPhone 14 | 1170×2532 | 460 | https://support.apple.com/en-us/111850 |
| iPhone 15 | 1179×2556 | 460 | https://support.apple.com/en-us/111831 |
| iPhone 15 Pro Max | 1290×2796 | 460 | https://support.apple.com/en-us/111828 |
| iPhone 16 | 1179×2556 | 460 | https://support.apple.com/en-us/121029 |
| iPhone 16 Pro | 1206×2622 | 460 | https://support.apple.com/en-us/121031 |
| iPhone 16 Pro Max | 1320×2868 | 460 | https://support.apple.com/en-us/121032 |
| iPad mini (6th gen) | 1488×2266 | 326 | https://support.apple.com/en-us/111886 |
| iPad (10th gen) | 1640×2360 | 264 | https://support.apple.com/en-us/111840 |
| iPad Pro 11" (4th gen) | 1668×2388 | 264 | https://support.apple.com/en-us/111842 |
| iPad Pro 12.9" (6th gen) | 2048×2732 | 264 | https://support.apple.com/en-us/111841 |

## Samsung

| Device | Resolution | PPI | Source |
|---|---|---|---|
| Galaxy S21 | 1080×2400 | 421 | samsung.com spec pages / GSMArena |
| Galaxy S23 | 1080×2340 | 425 | samsung.com spec pages / GSMArena |
| Galaxy S24 | 1080×2340 | 416 | https://www.samsung.com/ae/support/mobile-devices/what-are-the-sizes-and-the-resolution-of-the-new-s24-series/ |
| Galaxy S24 Ultra | 1440×3120 | 505 | https://www.samsung.com/latin_en/smartphones/galaxy-s24-ultra/specs/ |
| Galaxy A54 | 1080×2340 | 403 | samsung.com spec pages / GSMArena |
| Galaxy Z Fold5 (cover) | 904×2316 | ~402 | https://www.samsung.com/ae/support/mobile-devices/what-are-the-display-sizes-dimensions-and-screen-quality-specifications-of-various-z-fold5-and-z-flip5-variants/ |

## Google

| Device | Resolution | PPI | Source |
|---|---|---|---|
| Pixel 7 | 1080×2400 | 416 | store.google.com spec pages / GSMArena |
| Pixel 8 | 1080×2400 | 428 | https://store.google.com/product/pixel_8_pro_specs |
| Pixel 8 Pro | 1344×2992 | 489 | https://store.google.com/product/pixel_8_pro_specs |
| Pixel 9 | 1080×2424 | 422 | store.google.com spec pages / GSMArena |

## Notes

- **Viewport vs. resolution.** Phone browsers lay out pages at the CSS
  viewport (e.g. 393×852 on iPhone 15), not the physical resolution. The
  preview iframe uses the viewport so breakpoints behave exactly as on
  device; the physical resolution and PPI are shown as reference data.
- **iPhone 13 mini anomaly.** It reports DPR 3 (rendering 1125×2436
  logically) but the panel is physically 1080×2340 at 476 ppi — iOS
  downsamples. The table shows the physical panel, matching Apple's page.
- **Rounding.** Where DPR × viewport doesn't exactly equal the physical
  panel (Pixel/Fold DPR 2.625), the physical values take precedence since
  they're the manufacturer-published numbers.

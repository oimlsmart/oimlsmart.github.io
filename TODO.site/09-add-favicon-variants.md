# Add favicon variants

**Status**: only 192x192 and 512x512 PNGs are present (copied from the smart app).

## Goal

Generate a complete favicon set for `site.webmanifest`:

- `favicon.ico` (multi-resolution: 16x16, 32x32, 48x48)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `favicon-96x96.png` (already present)
- `favicon.svg` (already present)
- `apple-touch-icon.png` (180x180, already present)
- `web-app-manifest-192x192.png` (already present)
- `web-app-manifest-512x512.png` (already present)

## Source

- `/Users/mulgogi/src/oimlsmart/smart/browser/public/oiml-logo.pdf` — the source PDF artwork.
- `/Users/mulgogi/src/oimlsmart/smart/browser/public/oiml-mark.svg` — the simplified SVG mark.

## Approach

Use a favicon generator (e.g. realfavorgenerator.net) or ImageMagick:

```bash
convert -density 384 oiml-mark.svg -resize 16x16 favicon-16x16.png
convert -density 384 oiml-mark.svg -resize 32x32 favicon-32x32.png
# etc.
```

Update `public/site.webmanifest` to include all sizes.

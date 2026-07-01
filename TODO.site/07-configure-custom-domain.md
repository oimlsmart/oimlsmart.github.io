# Configure www.oimlsmart.org domain

**Status**: pending DNS / GitHub Pages configuration.

## Goal

Serve the GitHub Pages site at `www.oimlsmart.org`.

## Steps

1. **Acquire the domain** `oimlsmart.org` via a registrar (if not already owned).
2. **Configure DNS**:
   - `A` record for `www.oimlsmart.org` → GitHub Pages IPs (185.199.108.153, .109.153, .110.153, .111.153).
   - `CNAME` record for the apex if needed.
3. **Add the custom domain** in the GitHub repository settings → Pages → Custom domain.
4. **Add a `CNAME` file** to the deployed root containing `www.oimlsmart.org`. (VitePress: place it in `public/CNAME`.)
5. **Enforce HTTPS** in GitHub Pages settings.
6. **Verify** in GitHub Pages settings that the DNS check passes.

## VitePress specifics

Add `public/CNAME` containing the bare domain so VitePress copies it into `.vitepress/dist/`. Without this, each deploy will reset the custom domain setting.

```bash
echo "www.oimlsmart.org" > public/CNAME
```

## Acceptance

- `https://www.oimlsmart.org` serves the site.
- HTTPS certificate is valid.
- Both `oimlsmart.org` and `www.oimlsmart.org` resolve (or one redirects to the other).

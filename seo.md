Built-in (free, just code)
Next.js already handles most of it natively — you just need to add these files:

File	What it does
app/layout.tsx → metadata export	Titles, descriptions, OG tags, canonicals
app/sitemap.ts	Auto-generates /sitemap.xml
app/robots.ts	Auto-generates /robots.txt
app/manifest.ts	Web app manifest
next/image	Optimized images (better LCP)

That's it — no plugins needed.  Next.js serves these automatically at the correct URLs.

NPM packages (
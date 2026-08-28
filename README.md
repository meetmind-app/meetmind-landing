# MeetMind AI Landing v2

## What is implemented
- New Landing v2 information architecture and Russian editorial master.
- English x-default root page and Russian `/ru/` page.
- Static HTML content for crawler visibility; core copy does not depend on JavaScript rendering.
- Canonical URLs, `hreflang` for currently production-ready EN/RU, Open Graph, Twitter cards, robots directives and JSON-LD.
- `robots.txt` explicitly allows public search/AI crawlers; `User-agent: *` keeps future crawlers crawlable by default.
- `sitemap.xml` with EN/RU alternates and x-default.
- `llms.txt` and `llms-full.txt` factual summaries for AI discovery/answer engines.
- Responsive desktop/mobile layout, sticky header, mobile nav, CTA tracking hooks, UTM preservation and language routing.
- RTL-ready CSS foundation using logical properties. Arabic/Persian pages should set `dir="rtl"` when localized.
- Product-demo area is video-ready and currently uses a poster image.
- Current real MeetMind product assets: Telegram report, Interactive Web Report, Executive PDF and Mini App upload screen.

## Planned locales
The locale manifest contains 19 planned landing locales: en, ru, de, es, pt-BR, fr, it, tr, id, vi, ms, fil, pl, ro, nl, hi, ar, uz, fa.

Only EN and RU are marked `ready` in this build. This is intentional: untranslated pages should not be published/indexed as duplicates. Once a locale is translated, generate its static HTML URL and add its `hreflang` to every localized page and `sitemap.xml`.

## Product demo video
Current markup uses the static poster. When the final video is ready, replace the poster `<img>` inside `.demo-frame` with the commented `<video>` block and add:
- `assets/video/meetmind-demo.webm`
- `assets/video/meetmind-demo.mp4`

Recommended markup already included in the HTML comment:
`<video autoplay muted loop playsinline poster="...">`.

## Production checks before publish
1. Confirm `https://meetmind.ai` is the final landing origin. If not, replace it in canonical, Open Graph, JSON-LD, sitemap and robots sitemap URL.
2. Add real Terms and Privacy URLs before production if their routes differ from `/terms/` and `/privacy/`.
3. When translations are approved, publish each locale as static HTML and extend hreflang/sitemap.
4. Add the final video sources only after web compression.
5. Validate with Google Rich Results Test / Schema validator, Google Search Console and Bing Webmaster Tools after deploy.
6. Verify host/CDN/WAF does not block crawler user agents or published OpenAI search crawler IP ranges.

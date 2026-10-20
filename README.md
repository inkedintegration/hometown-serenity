# Hometown Serenity

Source for the Hometown Serenity website, shared for developer feedback.

**Live website:** https://hometownserenity.com

This snapshot matches the approved production release of October 20, 2026. The site was developed with AI assistance and owner-directed visual/content review.

## Feedback welcome

Specific, constructive feedback is welcome on accessibility, mobile usability, loading performance, the custom scroll/video animation, and maintainability. Please include the URL, browser/device, steps to reproduce, and the improvement you suggest. Issues and proposed pull requests are welcome; changes require owner review.

## Stack

- Static HTML, custom CSS, and vanilla JavaScript.
- Fifteen content pages plus a custom 404 page.
- No frontend framework, CMS, application backend, database, or runtime package dependencies.
- Self-hosted WOFF2 fonts, images, and desktop/mobile MP4 media.
- Native HTML details/summary elements for FAQ dropdowns.
- Netlify hosting with `_headers` and `_redirects` configuration.

## Run locally

From this folder, use any static HTTP server. For example, with Python 3 installed:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/. Opening HTML directly through a file URL will not resolve root-relative assets correctly.

A basic static server does not interpret Netlify `_headers`/`_redirects` or automatically serve the custom error page. Preview its appearance at `/404.html`; the deployed host handles genuine missing URLs with HTTP 404. Locally `/book` does not redirect unless the server supports the Netlify rules.

## Code map

- `index.html`: homepage, founder profile, approach, FAQ and contact sections.
- `sessions/`: session information and rates.
- `explore/`: searchable topic library and topic pages.
- `writing/`: writing index and educational articles.
- `privacy/` and `hypnosis-vs-hypnotherapy/`: supporting information.
- `styles.css`: shared production stylesheet.
- `docs/styles-readable.css`: readable equivalent of the shared CSS before formatting compaction, provided for review; not loaded by the website.
- `site.js`: homepage navigation, motion controls, scroll effects and flower-video scrubbing.
- `reading.js`: interior-page navigation.
- `topics.js`: browser-side topic search and filters.
- `404.html`, `404.css`, `404.js`: Still Water error page and motion controls.
- `assets/`: self-hosted media and fonts. Some earlier alternative assets remain in this exact published snapshot; the HTML/JS determines which are used.
- `robots.txt`, `sitemap.xml`, `site.webmanifest`: indexing and browser metadata.

The original flower-opening video and playback behavior are intentional design choices. Reduced-motion preferences, manual motion controls and a still fallback are included.

## Integrations and release workflow

The booking links use Netlify HTTP 302 redirects to an external Google Calendar appointment page. Social/profile/research links are ordinary outbound links; no embedded feeds, payment widgets or client-side analytics library is included.

Production is currently released manually through Netlify Drop. This repository is for source review and does not configure a deployment workflow. Updating the repository alone is not intended to publish a website release.

Only the published website snapshot and review documentation are included. Local backups, client records, account credentials and private audit working files are excluded.

## Permissions

No open-source license has been added. Public availability for review does not grant a general license to reuse the site's branding, portraits, text, or media. Third-party font and other asset rights remain subject to their applicable licenses.

# Kyeong-Rae Kim — personal website

A single-page research portfolio for GitHub Pages, written in HTML, CSS, and
vanilla JavaScript. No build step or package installation is required.

## Local preview

```sh
cd ~/profile
python -m http.server 8000
```

Open `http://localhost:8000` in a browser.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Introduction, news, publications, experience, education, awards, contact |
| `style.css` | Colors, typography, responsive layout, scroll transitions |
| `script.js` | Signal animation, motion controls, mobile navigation, BibTeX disclosure |
| `profile.jpg` | Original portrait supplied by Kyeong-Rae |
| `images/floorsav.png`, `images/padd.png` | Figures from the existing project pages |
| `images/social-preview.png` | Link-sharing preview image |
| `cv.html` | Editable, printable CV source |
| `cv.pdf` | Downloadable PDF generated from `cv.html` |
| `assets/favicon.svg` | Site icon |
| `.nojekyll` | Serve these static files directly through GitHub Pages |

## Editing

- Edit text, dates, publication links, and the PADD citation in `index.html`.
- The portrait uses CSS `object-fit: cover` without changing the original image.
  Adjust `.portrait-frame img` → `object-position` in `style.css` to reposition
  the crop. Desktop uses a 4:5 frame; mobile uses a square frame.
- Colors are CSS variables at the top of `style.css`.
- Update `cv.html` alongside homepage changes, then print it to PDF from a
  browser with A4 paper, background graphics enabled, and browser headers and
  footers disabled. Save the output as `cv.pdf`.
- FloorSAV is labeled `arXiv, 2026`, following the supplied CV. The authors and
  paper URL were checked against the existing FloorSAV project page.
- The site links directly to `/PADD/` and `/FloorSAV/`; those project sites
  remain in their own repositories.
- No Scholar profile is linked because a verified profile URL was not supplied.

## GitHub Pages

The target repository is `byulharang/byulharang.github.io`.
In **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder
`/ (root)`. After committing and pushing these files, GitHub Pages can serve
the site at `https://byulharang.github.io/`.

## Accessibility and motion

The content and links work without JavaScript. With JavaScript enabled, the
page adds section reveals, a decorative canvas, a responsive menu, and a
BibTeX disclosure. The animation stops outside the viewport or in a hidden
tab, respects `prefers-reduced-motion`, and can be paused from the hero.
Navigation supports keyboard focus and Escape to close the mobile menu.

## Asset sources

- FloorSAV figure: <https://byulharang.github.io/FloorSAV/assets/figures/framework.png>
- PADD figure: embedded teaser from <https://byulharang.github.io/PADD/>
- Portrait: supplied by Kyeong-Rae Kim.
- Typefaces: Manrope and DM Sans through Google Fonts, with local system fallbacks.
- The layout, procedural signal sculpture, and graphic identity are original
  to this site. The reference portfolio informed the information structure.

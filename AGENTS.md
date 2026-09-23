# TTAGGC — personal site

Eleventy (v3) static site. `npm start` to preview at localhost:8080, `npm run build` to clear and rebuild `_site/` (gitignored). This removes stale routes and previewed drafts.

## Context

Shriram is a PhD student at UIUC who builds software for genomics — he assembles and
compares the genomes of Arctic and Antarctic fishes to work out how cold adaptation is
written into DNA, and is interested in what DNA language models learn about repetitive
sequence. A programmer/biologist, **not** an artist.

The site name is the *C. elegans* telomere repeat, explained on `/about/`. His bio is his
own words, kept in `_data/site.json` — **do not rewrite or embellish it.** An earlier
session invented plausible-sounding research claims that were not true.

## History — read this before proposing a redesign

An earlier session built a large redesign (three-way light/dark/amoled theme toggle,
illustrated nav from a `_data/nav.json`, CV and Projects pages, an intro/bio block).
**Shriram looked at it and preferred the original simpler site**, so it was rolled back.
That work still exists on the `major-refactor` branch if any of it is ever wanted again;
that branch also holds notes on the XXIIVV webring guidelines and the ramaduwaji.com /
johnmacfarlane.net reference sites.

The lesson: **this site is meant to be small.** Do not add structure it did not ask for.

## Design

The look is modelled on [void.cc](https://void.cc/) — monospace throughout, a single
left-aligned column, links as outlined chips that invert on hover. Shriram picked this
deliberately.

All tunable values are custom properties at the top of `css/styles.css`. `--accent` is the
one value links, nav chips, the copy button and parts of the syntax theme all key off.

### Themes

Three palettes, chosen by Shriram (Aug 2026), switched by three swatches at the right-hand
end of the nav row:

| `data-theme` | ground | accent | when |
|---|---|---|---|
| *(none)* | amoled `#000` | `#EC5B38` vermilion | **the default**, for everyone, on any OS |
| `black` | amoled `#000` | `#EC5B38` vermilion | pinned — same palette as the default |
| `dark` | gruvbox material hard `#1d2021` | `#d8a657` soft yellow | **pinned only** |
| `light` | `#fff` | `#1a5fb4` blue | **pinned only** |

Rules that must hold:

- **There is no auto state and no `prefers-color-scheme` query.** Unpinned is amoled black
  on every OS. This reverses an earlier decision (the site used to follow the browser and
  black was pinned-only); Shriram asked for the original always-black site back in Aug 2026,
  having been offered the follow-the-browser option explicitly. Do not reintroduce auto.
- **A `data-theme` attribute only ever comes from a click on a swatch** (stored in
  `localStorage` under `theme`). Nothing else sets one.
- **Black is written as `:root, :root[data-theme="black"]`** — one declaration block, since
  no media-query boundary separates them any more. The bare `:root` sits *after* the pinned
  `dark` and `light` blocks in the file, which is safe: an attribute selector outranks it on
  specificity, so a pin still wins regardless of source order.
- **`dark` and `light` are each written once.** The light palette used to be duplicated
  across the media query; that query is gone and so is the duplicate. Do not re-split them.
- **No colour literals below the palette blocks in `styles.css`.** Every themed value —
  including the Prism `--tok-*` tokens and `--on-accent` (text sitting on an accent fill) —
  is a property, or a theme comes out two-thirds applied. The only exceptions are the three
  `--swatch` colours, which must ignore the active theme.
- **`--on-accent` matters more than it looks.** `dark`'s accent is a light yellow, so the
  text and art sitting on an accent fill are dark there while the ground is dark too. Any
  new accent needs its `--on-accent` checked against it, not assumed.
- **The wordmark is drawn white; the nav icons are drawn black.** Exactly one of them needs
  a CSS invert on any given ground, and it swaps on `light` — hence `--logo-invert`,
  `--icon-invert`, and `--icon-invert-active` (the icon inside a filled chip).
- **A blocking inline script in `<head>` replays a pinned theme** before the stylesheet.
  Anything later and the page paints in one palette and repaints in another. That same
  script adds `.has-js`, which is what unhides the switcher — it is inert without JS, so it
  is not shown without JS.
- **Which swatch reads as pressed is computed, not read off the attribute** — unpinned the
  attribute is absent, so the bottom script falls back to the string `"black"`. It no longer
  consults `matchMedia`; there is nothing for the OS to change.

## Structure

Two navigation links, defined in `_data/nav.json`: Home and About. Text chips, without illustrations.

```
index.njk          /: Writing (newest first), Ongoing (alphabetical)
about/about.md     /about/: about the site, CV link, what TTAGGC means
posts/*.md         all writing and living pages in one folder
posts/posts.json   shared layout, entry: true, no structural tags
_includes/entries.njk  shared entry list for Home and tag pages
tags.njk           /tags/<tag>/: matching Writing and Ongoing lists
```

Entries use optional `tags: [genomics, programming]`. Tags are topics only. No category directories, section indexes, or structural tags. `.eleventy.js` selects `entry: true` for the `writing`, `ongoing`, and `topics` collections. Draft exclusion applies to all three. Tag URL collisions fail the build.

Living pages use `living: true` and `updated:` instead of `date:`. Guitar, piano, reading list, gaming, tech stack, and lab space are living pages. Lab space remains a draft. Migrated notes have explicit `permalink:` values preserving their old URLs. New entries use `/posts/<filename>/`.

The homepage no longer displays the xkcd image. The asset is retained. The original bio in `_data/site.json` is unchanged.

The masthead is a wrapping flex row: wordmark and bio share the top line, and the nav
claims a full-width row underneath (`flex: 0 0 100%`). The nav is wider than the wordmark,
so if it is allowed to share a row the bio gets squeezed into a sliver — that is why
`--measure` is 780px rather than void.cc's 624px, with prose capped at 64ch in `<main>`
so posts still read at a sane width.

That nav row is itself a flex row holding the chip list and the theme switcher. The
switcher is a real flex item, so the chips would centre in what is left of the row and
drift left of the page centre; `.masthead nav::before` is an empty item of the same width
on the other side, putting them back. Keep the two widths equal (`--switch-w`) if either
moves. It is not a floating corner control on purpose — the top row is the wordmark and
the bio, so a corner control lands on the bio on the homepage.

Four things that will bite:

- **`.njk` files are Nunjucks, not markdown.** Write HTML in them. (`## Posts` once
  rendered literally as "## Posts" for exactly this reason.)
- **Tag pages need `eleventyExcludeFromCollections: true`.** Only Markdown entries should enter the writing and ongoing collections.
- **`.eleventyignore` must list `AGENTS.md`, `CLAUDE.md`, and `.CLAUDE.md`**, or the instructions symlink is processed as a page.
- **The section-label class is `.label`, not `.tag`.** Prism emits `.token.tag` for markup
  languages, and a bare `.tag` rule would restyle it inside every HTML code block.

Everything else: `images/` is passthrough-copied, add via `./add-image.sh <path>`.
`images/logo.svg` is the hand-drawn wordmark, white (`#fff`), correct on a permanently
black site. `images/nav/*.svg` are black line art inverted to white by CSS — they are
placeholders and Shriram intends to redraw them. Draw in black.

## Dates

Every dated entry carries `date: YYYY-MM-DD` in frontmatter; existing posts were backfilled
from their first commit. `./new-post.sh "Title"` stamps today's date and creates a draft in `posts/`. Use `./new-post.sh --living "Title"` for a living page.

The date is **metadata, never a heading** — Shriram was specific about this. It renders as a
muted, right-aligned, tabular-nums column in listings, and as a small kicker above the title
on an entry. Living pages use `updated:` instead and render "last updated ...".

## Code blocks

`@11ty/eleventy-plugin-syntaxhighlight` runs Prism **at build time** — there is no Prism in
the browser. The plugin emits Prism's `.token.*` classes but ships no theme; the theme is
the last block of `css/styles.css`.

Three properties that must survive any future edit:
- **Copy-paste stays exact.** No line numbers, no prompt markers, nothing injected inside
  `<pre>`. The copy button is a sibling of `<pre>`, never a child.
- **Wrapping is visual only** — `white-space: pre-wrap` plus `overflow-wrap: break-word`.
  Long shell one-liners wrap instead of scrolling sideways; the copied text is unwrapped.
- **JS is additive.** With JS off you still get highlighted, selectable code, just no button.

Fence with a language for highlighting: ```` ```python ````, ```` ```bash ````, ```` ```r ````.

## Math

`@vscode/markdown-it-katex` renders `$x = 5$` (inline) and `$$x = 5$$` (display) **at
build time**, same as Prism — the browser never receives a formula plus a script to
typeset it. Same delimiters Obsidian uses, so notes paste across unchanged. Literal
dollar amounts in prose ("cost $40 and $900") are left alone.

**The one thing that will bite:** the plugin bundles its own KaTeX and renders with
*that*, while `.eleventy.js` copies `katex.min.css` and the woff2 fonts out of the
top-level `katex` package. Those two must be the **same version** or npm stops deduping
them, one version's CSS lands on the other's markup, and every fraction collapses onto
its own rule — legible enough at a glance to miss. `katex` is pinned to `^0.16` to match.
Bump both together or not at all.

`katex.min.css` is linked **only by pages that contain KaTeX markup** — the layout
tests `{% if "katex" in content %}`, which works because the formulas are already
rendered by then. It is 23KB and most pages have no maths, and the site is kept under
512kb.club's 100KB green-team budget. Don't move that link back out of its `if`.

Math only works where markdown runs — `.md` files, not `.njk`, and not in frontmatter
`title:` (which is plain text run through the `emphasis` filter, asterisks only).

## Images

There will be a lot of them, and they should not read as hard rectangles.

- **Default:** every `main img` gets *irregular* border-radii — no two corners of an image
  match, and `:nth-of-type` cycles three corner sets so a page of images doesn't look
  stamped out. Chosen over a uniform radius (reads as a CSS default) and over a torn edge
  (unsafe as a default — see below). It only ever touches the corners.
- **`class="sharp"`** — square corners. For plots, screenshots, anything where the edge
  carries information.
- **`class="torn"`** — torn-paper edge via `images/edge-mask.svg` as a CSS mask. Photos
  only. It nibbles a few pixels off *all four* sides, which clipped the captions on the
  xkcd test image; that is exactly why it is opt-in rather than the default.

`images/edge-mask.svg` is generated, not drawn: a rectangle path whose perimeter points are
jittered along their normals, with a fixed random seed so it is stable across builds.
Regenerate it with a smaller `JIT` if the tear ever eats too much.

**Page weight is a constraint.** Keep Home below 512kb.club's 100KB green-team limit. Removing the xkcd image freed space, but avoid adding unnecessary assets. Size new images for their rendered width and prefer WebP for photographic or line-art-heavy images. `images/logo.svg` is svgo-optimised at precision 1. Re-exporting it from the drawing tool can add 39KB to every page.

Markdown `![](...)` can't carry a class, so `sharp`/`torn` need raw `<img>` — which is what
`./add-image.sh` already emits, and it prints both options as a reminder.

**Captions** are `<figure>` + `<figcaption>`, set at `.8rem` and `--muted` — the same
treatment dates get, because a caption is metadata too. A markdown image *title* builds
the figure automatically: `![alt](/images/x.png "The caption")`. Three things to know:

- Only an image with a title, alone in its paragraph, becomes a figure. `alt` is left
  alone on purpose — it describes the image to a screen reader, which is a different job
  from a caption, and keying off the title meant no existing image on the site changed.
- Captions go through the inline renderer, so `*C. elegans*` italicises. (Frontmatter
  `title:` still can't — that goes through the `emphasis` filter instead.)
- Anything needing a class or a width has to be hand-written as a `<figure>`.

`:nth-of-type` counts among siblings, so an `<img>` alone inside its `<figure>` is always
the 1st of its type and every captioned image would take the *same* corner set. The CSS
cycles `main figure:nth-of-type(...)` alongside `main img:nth-of-type(...)` to fix that —
keep both halves if either is ever edited. A caption also makes `torn` safe again: the
text is a sibling of the image now, so the mask can't clip it.

## Conventions

- Posts repeat their title as an `<h1>` in the body — the layout does not render it, so this
  is not duplication

## Authoring

`README.md` is the user-facing guide — how to add, edit, and remove posts and living pages.
Keep it in sync when any of that changes.

- `./paste-image.sh [name]` takes the clipboard image (via `osascript` and
  `«class PNGf»` — there is no `pngpaste` and the system Python has no PyObjC on this
  machine), writes it to `images/`, and leaves the markdown snippet on the clipboard.
- Frontmatter `title:` supports `*asterisk italics*` through the `emphasis` filter, for
  species names. `<title>` uses the `plain` filter instead, since it can't hold markup.
  Underscores are deliberately NOT treated as emphasis — gene and file names use them.
  `emphasis` escapes HTML before substituting, so titles can't inject markup.

## Agent notes — running log

Log work to `agent_notes.md` next to this file, or a subdirectory's if the work belongs there. Entry format and rules: vault root `AGENTS.md`.

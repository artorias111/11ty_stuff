# TTAGGC — personal site

Eleventy (v3) static site. `npm start` to preview at localhost:8080, `npm run build` to
write `_site/` (gitignored).

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

The look is modelled on [void.cc](https://void.cc/) — monospace throughout, true black,
a single ~640px left-aligned column, links as yellow-outlined chips that invert on hover.
Shriram picked this deliberately; amoled `#000` is not negotiable, and there is no theme
toggle by design.

All tunable values are custom properties at the top of `css/styles.css`. `--accent` is a
slightly softened yellow — set it to `yellow` for the literal void.cc treatment.

## Structure

Five nav sections, defined in `_data/nav.json`: Home, About, Notes, Posts, Projects.
"Notes" was chosen over "Knowledge" — the bucket is inventory and habit, not expertise.

```
index.njk          / — xkcd image + collections.recent (everything dated, mixed)
about/about.md     /about/ — bio (TODO), CV link, what TTAGGC means
notes/index.njk    /notes/ — sub-section index + recent notes
  tech-stack.md      living page, not in the dated stream
  lab-space.md       living page, not in the dated stream
  food/  travel/  reading/    dated streams, one index.njk + entries each
posts/index.njk    /posts/ — technical writing, and what he's learning
projects/index.njk /projects/ — TODO, still a stub
```

The masthead is a wrapping flex row: wordmark and bio share the top line, and the nav
claims a full-width row underneath (`flex: 0 0 100%`). The nav is wider than the wordmark,
so if it is allowed to share a row the bio gets squeezed into a sliver — that is why
`--measure` is 780px rather than void.cc's 624px, with prose capped at 64ch in `<main>`
so posts still read at a sane width.

Four things that will bite:

- **`.njk` files are Nunjucks, not markdown.** Write HTML in them. (`## Posts` once
  rendered literally as "## Posts" for exactly this reason.)
- **Section index pages need `eleventyExcludeFromCollections: true`.** They live inside a
  tagged directory, and Eleventy *merges* tags down the cascade rather than replacing them,
  so `tags: []` does not work — `/posts/` listed itself until this was fixed.
- **`.eleventyignore` must list `CLAUDE.md`**, or this file gets published at `/CLAUDE/`.
- **The section-label class is `.label`, not `.tag`.** Prism emits `.token.tag` for markup
  languages, and a bare `.tag` rule would restyle it inside every HTML code block.

Everything else: `images/` is passthrough-copied, add via `./add-image.sh <path>`.
`images/logo.svg` is the hand-drawn wordmark, white (`#fff`), correct on a permanently
black site. `images/nav/*.svg` are black line art inverted to white by CSS — they are
placeholders and Shriram intends to redraw them. Draw in black.

## Dates

Every dated entry carries `date: YYYY-MM-DD` in frontmatter; existing posts were backfilled
from their first commit. `./new-post.sh <posts|food|travel|reading> "Title"` stamps today's
date and files it in the right directory.

The date is **metadata, never a heading** — Shriram was specific about this. It renders as a
muted, right-aligned, tabular-nums column in listings, and as a small kicker above the title
on an entry. The two living pages use `updated:` instead and render "last updated ...".

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

## Conventions

- No dates on posts; ordering is `collections.post | reverse`
- Posts repeat their title as an `<h1>` in the body — the layout does not render it, so this
  is not duplication
- Don't commit unless asked

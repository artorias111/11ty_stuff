# TTAGGC — personal site

Eleventy (v3) static site. `npm start` to preview at localhost:8080, `npm run build` to
write `_site/` (gitignored).

## Context

Shriram is a PhD student (genome evolution, *C. elegans*) — a programmer/biologist, **not**
an artist. Site name is the *C. elegans* telomere repeat, explained on `/about/`.

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

- `index.njk` — the xkcd image and an auto-generated post list from `collections.post`.
  It is Nunjucks, so **markdown syntax does not work in it** — write HTML. (`## Posts`
  once rendered literally as "## Posts" for this reason.)
- `_includes/default.njk` — the only layout: masthead (wordmark + Home/About nav) and the
  copy-button script.
- `blog/*.md` — posts. `blog/blog.json` supplies `layout` and `tags: post`, so a new post
  needs only `title`. Use `./new-post.sh "Title"`.
- `about/about.md` — the one standalone page.
- `images/` — passthrough-copied; add via `./add-image.sh <path>`. `images/logo.svg` is the
  hand-drawn wordmark and is white (`#fff`), which is correct on a permanently black site.
  `images/nav/{home,about}.svg` are black line art, inverted to white by CSS.

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

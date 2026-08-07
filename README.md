# TTAGGC

Personal site, built with [Eleventy](https://www.11ty.dev/). Everything you write
day to day is plain markdown.

## Preview

```bash
npm start
```

Open <http://localhost:8080>. It live-reloads — save in Zed and the browser updates
itself. Leave it running while you write; it shows real fonts, real colours, real
image edges, which markdown preview can't.

`npm run build` writes the finished site to `_site/` (gitignored).

---

## The five sections

| Section | Lives in | What goes there |
|---|---|---|
| Posts | `posts/` | Technical writing, what you're learning |
| Projects | `projects/index.njk` | Past work |
| About | `about/about.md` | Bio, CV link |
| Notes → Food | `notes/food/` | Recipes |
| Notes → Travel | `notes/travel/` | Places |
| Notes → Reading | `notes/reading/` | Books |

Plus two **living pages** — `notes/tech-stack.md` and `notes/lab-space.md`. Those aren't
dated entries; you edit them in place and bump their `updated:` line.

---

## Writing a post

```bash
./new-post.sh posts "Calling telomere variants"
./new-post.sh food  "Malai broccoli, again"
```

The first argument is the section: `posts`, `food`, `travel` or `reading`. The script
creates the file in the right directory, stamps today's date, and opens your editor.
To make that Zed, put this in your shell profile:

```bash
export EDITOR="zed --wait"
```

You can also just create the file by hand. A post needs exactly two lines of
frontmatter:

```markdown
---
date: 2026-08-07
title: Calling telomere variants
---

# Calling telomere variants

Write here.
```

No `layout`, no `tags`, no linking it from anywhere. It appears in its section's
listing and on the homepage automatically, sorted by `date`, newest first.

**Editing** a post is just editing the file. Leave `date` alone unless you want it
to move in the ordering.

**Deleting** a post is just deleting the file. Nothing else references it.

**Moving** a post to a different section is moving the file — `git mv posts/x.md
notes/food/x.md`. It picks up the new section automatically.

---

## Images

Copy an image (screenshot with **Cmd+Ctrl+Shift+4**, or copy from a browser), then:

```bash
./paste-image.sh telomere-length
```

It saves the clipboard image to `images/telomere-length.png` and leaves
`![](/images/telomere-length.png)` **on your clipboard** — so it's Cmd+V straight into
Zed. Leave the name off and it uses the date plus a counter.

For a file you already have:

```bash
./add-image.sh ~/Downloads/figure.png
```

### Edges

Images get **hand-cut corners** by default — irregular radii, cycling through three
corner sets so a page of images doesn't look stamped out. You don't have to do
anything for that.

To override, write the tag out instead of using markdown:

```html
<img class="sharp" src="/images/figure.png" alt="">   <!-- square: plots, screenshots -->
<img class="torn"  src="/images/figure.png" alt="">   <!-- torn paper: photos -->
```

Use `sharp` whenever the edge of the image carries information. `torn` shaves a few
pixels off all four sides, so don't use it on anything with text near the border.

---

## Species names

Markdown italics work in body text **and in headings**:

```markdown
## What *C. elegans* tells us
```

Frontmatter is different — markdown never runs on it — but `title:` is wired to
understand asterisks anyway:

```markdown
---
title: Biological discoveries via *C. elegans* research
---
```

That renders italic in listings and on the homepage, and the asterisks are stripped
out of the browser tab title. **Asterisks only** — underscores are left alone, because
they show up in gene and file names too often to treat as formatting.

---

## Code

Fence with a language and it's highlighted at build time:

````markdown
```python
import pysam
```
````

Long lines wrap instead of scrolling sideways, and every block gets a **copy** button
on hover that copies the source exactly — no line numbers, no prompt characters.

---

## Adding a new section

Say you want **Music**. Three steps.

**1.** Make the folder and tell Eleventy what's in it:

```bash
mkdir -p notes/music
cat > notes/music/music.json <<'EOF'
{
  "tags": ["note", "music"],
  "section": "Music"
}
EOF
```

**2.** Give it a listing page. Copy an existing one and change the two names:

```bash
sed 's/Reading/Music/; s/collections.reading/collections.music/' \
  notes/reading/index.njk > notes/music/index.njk
```

Then edit the blurb line in `notes/music/index.njk`.

**3.** Link it from `notes/index.njk`, in the `<ul class="sections">` block:

```html
<li><a href="/notes/music/">Music</a></li>
```

Then add `music` to the `case` list in `new-post.sh` so `./new-post.sh music "..."`
works.

A **top-level** section (a sibling of Posts rather than a Note) is the same, except
it lives at the repo root instead of inside `notes/`, and you add it to
`_data/nav.json` instead of the Notes list.

## Removing a section

Delete its folder, remove its `<li>` from `notes/index.njk` (or its entry in
`_data/nav.json`), and drop it from `new-post.sh`. Nothing else points at it.

## Reordering or renaming the top nav

`_data/nav.json`, in order. Each entry is a label, a URL, and an icon:

```json
{ "label": "Posts", "url": "/posts/", "art": "/images/nav/posts.svg" }
```

Drop `"art"` and the item renders as plain text — useful while you're drawing a
replacement icon. The icons are black line art inverted by CSS, so **draw in black**.

---

## Layout

```
index.njk            homepage: bio + everything dated, mixed
_data/nav.json       top nav: order, labels, icons
_data/site.json      the bio paragraph
_includes/default.njk  the only layout
css/styles.css       all styling; the knobs are at the top
posts/               \
notes/food/           |  markdown entries + one index.njk each
notes/travel/         |
notes/reading/       /
notes/tech-stack.md  living pages: edit in place, bump `updated:`
notes/lab-space.md
images/              everything is copied through as-is
```

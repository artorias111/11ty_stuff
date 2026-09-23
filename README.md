# TTAGGC

Personal site, built with Eleventy. Home has Writing and Ongoing lists. About is the only other navigation link.

## Run it

- `npm start` previews at http://localhost:8080 and includes drafts.
- `npm run build` clears `_site/` and rebuilds without drafts.
- To preview what ships: `npm run build && npx serve _site`.

## Write something

```bash
./new-post.sh "Calling telomere variants"
./new-post.sh --living "Guitar lessons"
```

Both create a Markdown file in `posts/` and open your editor. Set `EDITOR` to choose the editor. New files start as drafts. Remove `draft: true` when ready to publish.

A dated post appears in Writing, newest first:

```yaml
---
title: Calling telomere variants
date: 2026-09-23
tags: [genomics, programming]
draft: true
---
```

A living page appears in Ongoing, alphabetically:

```yaml
---
title: Guitar lessons
living: true
updated: 2026-09-23
tags: [music]
---
```

- Edit living pages in place and bump `updated:` when their content changes.
- To convert a post, replace `date:` with `updated:` and add `living: true`.
- Repeat the title as an `# H1` in the body. The layout does not print it.
- Dates are metadata. They appear beside entries and above the title.
- Titles support `*italics*` for species names. Underscores stay literal.

## Tags

- Tags are optional. Use `tags: []`, omit them, or add one or two useful topics.
- Use short names such as `genomics`, `programming`, `food`, or `music`.
- Clicking a tag shows matching Writing and Ongoing entries.
- Tag pages build automatically. No indexes, folders, or menus to maintain.
- Give tags distinct names that produce distinct URLs. Avoid variants like `Music` and `music`.
- Drafts only appear in tag pages during `npm start`.

## Files and links

- All posts and living pages live directly in `posts/`.
- New files get `/posts/<filename>/` URLs.
- Migrated notes keep their old URLs through `permalink:`. Leave that line in place to preserve links.
- Guitar, piano, reading, gaming, tech stack, and lab space are living pages. Lab space remains a draft.
- Delete a file to remove its entry. Listings and tags update automatically.
- `npm run build` clears old output, including removed pages and previously previewed drafts.

## Images

```bash
./paste-image.sh telomere-length    # clipboard → images/, snippet to clipboard
./add-image.sh ~/Downloads/x.jpg    # file → images/, prints the snippet
```

- Hand-cut irregular corners by default
- `class="sharp"` — square. Plots, screenshots, anything where the edge carries information
- `class="torn"` — torn-paper edge. Photos only
- A class or a width needs a real `<img>` tag; markdown `![]()` can't carry one

## Captions

Quoted title after the URL:

```markdown
![alt text](/images/x.png "The caption")
```

Or by hand, when you also need a class or width:

```html
<figure>
  <img class="torn" src="/images/x.jpg" alt="" width="50%">
  <figcaption>The caption.</figcaption>
</figure>
```

- Sets small and muted, centred under the image
- `*C. elegans*` italicises in a caption
- `alt` is not the caption — it describes the image to a screen reader. Fill in both

## Code

Fence with a language or you get no highlighting:

````markdown
```python
print("hi")
```
````

- `python` `bash` `r` `yaml` … highlighted at build time, no JS in the browser
- Copy button is automatic, and copies exactly what you wrote

## Math

- `$x = 5$` inline, `$$x = 5$$` on its own line
- Same delimiters as Obsidian, so notes paste across unchanged
- Only in `.md` files — not `.njk`, not in `title:`
- Real dollar amounts in prose are left alone

## Deleting

- Delete the `.md` file. Every listing that mentioned it updates on the next build
- Images in `images/` aren't cleaned up — remove those by hand

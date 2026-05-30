# Blog

Personal blog built with [Eleventy](https://www.11ty.dev/).

## Writing a new post

```bash
./new-post.sh "Your Post Title"
```

This creates `blog/your-post-title.md` pre-filled with a title and opens it in your editor. That's it — the post will appear on the homepage automatically.

### Manual alternative

Create a file in `blog/` with just a title in the frontmatter:

```markdown
---
title: Your Post Title
---

# Your Post Title

Write here...
```

No need to add `layout`, link it from the homepage, or touch any other file.

## Adding images

1. Drop the image in `images/`
2. Reference it in your post with an HTML img tag (not markdown syntax):

```html
<img src="../../images/your-image.jpg" alt="description" width="50%"/>
```

## Running locally

```bash
npx @11ty/eleventy --serve
```

Then open `http://localhost:8080`.

## Structure

```
blog/          # Posts go here
images/        # Images go here
_includes/     # HTML layout template
css/           # Styles
new-post.sh    # Post scaffolding script
```

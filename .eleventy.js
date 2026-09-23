const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const katex = require("@vscode/markdown-it-katex").default;

module.exports = function(eleventyConfig) {
  // ---- drafts -----------------------------------------------------------
  // `draft: true` in frontmatter keeps a page OUT of the built site: no file
  // is written and it leaves every collection, so nothing links to it.
  //
  // It is still served by `npm start`, so half-finished writing is visible
  // while you work on it and invisible to visitors. Delete the flag to ship.
  const SERVING = process.env.ELEVENTY_RUN_MODE !== "build";

  eleventyConfig.addGlobalData("eleventyComputed.permalink", () => (data) =>
    data.draft && !SERVING ? false : data.permalink);

  eleventyConfig.addGlobalData(
    "eleventyComputed.eleventyExcludeFromCollections",
    () => (data) =>
      data.draft && !SERVING ? true : data.eleventyExcludeFromCollections);

  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("files");   // CV pdf and anything else downloadable
  eleventyConfig.addPassthroughCopy("css");

  // KaTeX's stylesheet and the fonts it needs. katex.min.css asks for
  // fonts/KaTeX_*.woff2 relative to itself, which is why the CSS lands beside
  // a fonts/ directory. Only the woff2 files are copied — the .woff and .ttf
  // fallbacks in each @font-face are for browsers that predate the site.
  //
  // The `katex` dependency is pinned to ^0.16 to MATCH the version bundled
  // inside @vscode/markdown-it-katex, which is what actually renders the
  // formulas. If the two drift apart npm stops deduping them, this copies one
  // version's CSS over the other version's markup, and every fraction lands on
  // top of its own rule. Bump both together or not at all.
  eleventyConfig.addPassthroughCopy({
    "node_modules/katex/dist/katex.min.css": "css/katex.min.css",
    "node_modules/katex/dist/fonts/*.woff2": "css/fonts",
  });

  // Math, rendered at BUILD time like the syntax highlighting above — the
  // browser gets finished markup, never a formula plus a script to typeset it.
  //   $x = 5$      inline
  //   $$x = 5$$    display (own line, centred)
  // Same delimiters Obsidian uses, so notes paste across unchanged.
  eleventyConfig.amendLibrary("md", (md) => md.use(katex));

  // Figure captions. Markdown's image TITLE — the quoted string after the URL —
  // becomes a <figcaption>:
  //
  //   ![alt text](/images/x.png "The caption")
  //
  // Only an image carrying a title turns into a figure, and only when it is
  // alone in its paragraph. That is deliberate: `alt` and a caption are
  // different jobs (alt describes the picture to a screen reader, a caption
  // is editorial), and keying off the title instead means none of the images
  // already on the site change. Captions run through the inline renderer, so
  // *C. elegans* italicises the way it would anywhere else.
  //
  // For anything needing a class or an explicit width — sharp, torn, width=50%
  // — write the figure out by hand; the CSS is the same either way:
  //   <figure><img class="torn" src="..." alt=""><figcaption>…</figcaption></figure>
  eleventyConfig.amendLibrary("md", (md) => {
    md.core.ruler.push("figure_caption", function (state) {
      const tokens = state.tokens;
      for (let i = 0; i + 2 < tokens.length; i++) {
        if (tokens[i].type !== "paragraph_open") continue;
        const inline = tokens[i + 1];
        if (!inline || inline.type !== "inline") continue;
        if (tokens[i + 2].type !== "paragraph_close") continue;

        // Exactly one image and nothing else — a caption under a paragraph
        // that happens to also contain prose would be wrong.
        const content = inline.children.filter(
          (t) => !(t.type === "text" && t.content.trim() === ""));
        if (content.length !== 1 || content[0].type !== "image") continue;

        const image = content[0];
        const caption = image.attrGet("title");
        if (!caption) continue;

        // Drop the title, or the caption also shows up as a hover tooltip.
        image.attrs.splice(image.attrIndex("title"), 1);

        // Reusing the paragraph tokens keeps their nesting, which is what the
        // default renderer uses to emit the closing tag.
        tokens[i].type = "figure_open";
        tokens[i].tag = "figure";
        tokens[i + 2].type = "figure_close";
        tokens[i + 2].tag = "figure";

        const figcaption = new state.Token("html_inline", "", 0);
        figcaption.content =
          `<figcaption>${md.renderInline(caption, state.env)}</figcaption>`;
        inline.children.push(figcaption);
      }
    });
  });

  // Highlights fenced code blocks at BUILD time (Prism runs in Node, not the
  // browser). No client-side JS, and the markup stays plain text so code is
  // still selectable and copy-pasteable.
  eleventyConfig.addPlugin(syntaxHighlight);

  // ISO dates everywhere: sorts correctly, reads unambiguously, and lines up
  // in a monospace column. `date` in frontmatter wins; otherwise Eleventy
  // falls back to the file's creation time.
  eleventyConfig.addFilter("isoDate", function (d) {
    return new Date(d).toISOString().slice(0, 10);
  });

  // Frontmatter `title:` is plain text — markdown never runs on it — so
  // `title: The *C. elegans* genome` would show its asterisks in every
  // listing. These two filters fix that without turning titles into HTML:
  //   | emphasis  ->  *x* becomes <em>x</em>   (for anything on-screen)
  //   | plain     ->  *x* becomes x            (for <title>, which can't
  //                                             contain markup)
  // Only *asterisks* are supported, not _underscores_ — underscores turn up
  // in gene and file names too often to treat as formatting.
  const escapeHtml = (s) => String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  eleventyConfig.addFilter("emphasis", (s) =>
    escapeHtml(s).replace(/\*([^*]+)\*/g, "<em>$1</em>"));

  eleventyConfig.addFilter("plain", (s) =>
    String(s).replace(/\*([^*]+)\*/g, "$1"));

  const entries = (api) => api.getAll().filter((item) => item.data.entry);
  const newestFirst = (a, b) => b.date - a.date;
  const byTitle = (a, b) => a.data.title.localeCompare(b.data.title);

  eleventyConfig.addCollection("writing", (api) =>
    entries(api).filter((item) => !item.data.living).sort(newestFirst));

  eleventyConfig.addCollection("ongoing", (api) =>
    entries(api).filter((item) => item.data.living).sort(byTitle));

  eleventyConfig.addCollection("topics", (api) => {
    const byTag = new Map();
    for (const item of entries(api)) {
      for (const tag of new Set(item.data.tags || [])) {
        if (!byTag.has(tag)) byTag.set(tag, []);
        byTag.get(tag).push(item);
      }
    }
    const slugs = new Set();
    return [...byTag.entries()].sort(([a], [b]) => a.localeCompare(b))
      .map(([tag, items]) => {
        const slug = eleventyConfig.getFilter("slugify")(tag);
        if (!slug || slugs.has(slug)) throw new Error(`Tag needs a unique URL: ${tag}`);
        slugs.add(slug);
        return {
          tag, slug,
          writing: items.filter((item) => !item.data.living).sort(newestFirst),
          ongoing: items.filter((item) => item.data.living).sort(byTitle),
        };
      });
  });
};

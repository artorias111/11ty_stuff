const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const katex = require("@vscode/markdown-it-katex").default;

module.exports = function(eleventyConfig) {
  const SERVING = process.env.ELEVENTY_RUN_MODE !== "build";

  eleventyConfig.addGlobalData("eleventyComputed.permalink", () => (data) =>
    data.draft && !SERVING ? false : data.permalink);

  eleventyConfig.addGlobalData(
    "eleventyComputed.eleventyExcludeFromCollections",
    () => (data) =>
      data.draft && !SERVING ? true : data.eleventyExcludeFromCollections);

  eleventyConfig.addPassthroughCopy("images");

  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy({
    "node_modules/katex/dist/katex.min.css": "css/katex.min.css",
    "node_modules/katex/dist/fonts/*.woff2": "css/fonts",
  });
  eleventyConfig.amendLibrary("md", (md) => md.use(katex));
  eleventyConfig.amendLibrary("md", (md) => {
    md.core.ruler.push("figure_caption", function (state) {
      const tokens = state.tokens;
      for (let i = 0; i + 2 < tokens.length; i++) {
        if (tokens[i].type !== "paragraph_open") continue;
        const inline = tokens[i + 1];
        if (!inline || inline.type !== "inline") continue;
        if (tokens[i + 2].type !== "paragraph_close") continue;
        const content = inline.children.filter(
          (t) => !(t.type === "text" && t.content.trim() === ""));
        if (content.length !== 1 || content[0].type !== "image") continue;

        const image = content[0];
        const caption = image.attrGet("title");
        if (!caption) continue;
        image.attrs.splice(image.attrIndex("title"), 1);
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
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addFilter("isoDate", function (d) {
    return new Date(d).toISOString().slice(0, 10);
  });
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

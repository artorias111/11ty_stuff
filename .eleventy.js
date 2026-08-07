const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("css");

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

  // Everything dated, newest first — this is what the homepage shows. Each
  // entry carries a `section` label from its directory data file, so the list
  // can say where an item came from without inspecting its URL.
  eleventyConfig.addCollection("recent", function (api) {
    return api.getFilteredByTag("post")
      .concat(api.getFilteredByTag("note"))
      .sort((a, b) => b.date - a.date);
  });
};

const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("css");

  // Highlights fenced code blocks at BUILD time (Prism runs in Node, not the
  // browser). No client-side JS, and the markup stays plain text so code is
  // still selectable and copy-pasteable.
  eleventyConfig.addPlugin(syntaxHighlight);
};

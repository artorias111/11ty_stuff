# Agent notes — TTAGGC blog

Running log. Newest entry at the top; the `---` separator goes after each entry.
Dates are wikilinks — `[[MM-DD-YYYY]]`.
Format and rules: see `AGENTS.md`.

[[09-23-2026]]
agent: codex

- Summary: refactored to Home and About, with Writing, Ongoing, and optional topic tags. All entry files now live in `posts/`.
- Preserved 21 entry bodies, titles, draft flags, and bio. Migrated notes retain their URLs through permalinks. Guitar, piano, reading, gaming, tech stack, and lab space use living-page metadata.
- Removed section indexes and folder-based categories. Added shared entry listings and tag pages. Removed the homepage xkcd display; kept its asset.
- Simplified `new-post.sh` to accept a title, with optional `--living`. New files start as drafts. Updated README and repository instructions.
- Production builds clear stale output. Excluded instruction symlinks from Eleventy. Preserved the ignored Garageband draft after moving it.
- Checked production and preview builds, content preservation, internal links, draft filtering, authoring commands, desktop/mobile layout, themes, and no-JS navigation.
- Existing staged edits remain staged. The instruction symlink was renamed externally during this work; both names are excluded from builds.

---

[[09-14-2026 1]]
agent: claude

- Cut the homepage from 439.5 KB to 91.7 KB uncompressed, for 512kb.club's green team (<100 KB).
- `lymphocytes_2x.png` 337 KB -> `lymphocytes_2x.webp` 52 KB: it was 1301px wide, greyscale line art stored as 24-bit RGB, shown at ~276px. Now 600px, 8-bit, q85. Old png is in git history if a bigger one is ever wanted.
- `logo.svg` 53.7 KB -> 14.6 KB via svgo at precision 1; renders identically at 900px. Precision 0 got it to 5.6 KB but flattened the hand-drawn curves into polygons.
- `katex.min.css` (23 KB) is now linked only by pages that actually contain KaTeX markup — checked against every built page, no mismatches.
- `.eleventyignore` now lists `agent_notes.md`; this file was being published at `/agent_notes/`.

---

[[09-03-2026]]
agent: claude

- `CLAUDE.md` -> `AGENTS.md`; all in-repo references updated; running-log clause added.
- `.gitignore` and `.eleventyignore` entries updated so Eleventy still skips the agent file.

---

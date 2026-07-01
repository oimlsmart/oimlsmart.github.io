# Add a blog

**Status**: not started.

## Goal

Add a `blog/` directory with a programme-update feed, matching the lutaml.github.io pattern. Use VitePress's blog data loader (see `.vitepress/posts.data.ts` in lutaml).

## Why

Programme updates (new modelled Recommendations, new OIML-CS participants, conference talks, release notes) need a home. Currently the only place for these is the GitHub repository, which isn't reader-friendly.

## Approach

- `blog/index.md` — list page with frontmatter-driven post cards.
- `blog/<post-slug>.md` — one file per post with frontmatter (`date`, `title`, `author`, `summary`).
- `.vitepress/posts.data.ts` — a build-time data loader that exposes the post list to the index page.
- Add a "Blog" entry to the top nav.
- Optionally wire up an RSS feed (see [11-add-rss-feed.md](11-add-rss-feed.md)).

## Acceptance

- `blog/` exists with at least one launch post.
- Top nav links to `/blog/`.
- Posts are listed newest-first with date and summary.

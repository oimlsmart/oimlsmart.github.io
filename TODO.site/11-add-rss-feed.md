# Add an RSS/Atom feed

**Status**: not started. Depends on [05-add-blog.md](05-add-blog.md).

## Goal

Provide an RSS feed at `/feed.xml` (or `/rss.xml`) so subscribers can follow programme updates.

## Approach

Use a VitePress build-time data loader to read posts from `blog/`, then render an RSS XML file to `.vitepress/dist/feed.xml` as part of the build.

Libraries to consider:

- `feed` (npm) — generates RSS 2.0, Atom, and JSON feeds from a list of items.

Wire it into the VitePress build via a small plugin or by generating the file in `.vitepress/config.ts`.

## Acceptance

- `/feed.xml` is served and valid (validate with https://validator.w3.org/feed/).
- A `<link rel="alternate" type="application/rss+xml" href="/feed.xml">` is in the page head.

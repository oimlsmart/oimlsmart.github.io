/**
 * Build-time data loader for the blog index.
 *
 * Delegates the canonical transform to `./posts.ts > transformPosts`.
 * Adding a new frontmatter field: edit `posts.ts` once — both the
 * blog index and the RSS feed (see `.vitepress/rss.ts`) pick it up.
 */
import { createContentLoader } from 'vitepress'
import { transformPosts } from './posts'

export default createContentLoader('blog/*.md', {
  excerpt: true,
  includeSrc: false,
  transform(raw) {
    return {
      posts: transformPosts(raw as any),
    }
  },
})
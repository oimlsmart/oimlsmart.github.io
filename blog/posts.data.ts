/**
 * Build-time data loader for the blog index.
 *
 * VitePress calls this at build time. It reads every `blog/*.md` file
 * (except this one), extracts frontmatter, and exposes the result to
 * the blog index page as `data.posts`.
 *
 * Adding a new post = adding a new `.md` file in `blog/`. No other
 * edits required.
 */
import { createContentLoader } from 'vitepress'

export default createContentLoader('blog/*.md', {
  excerpt: true,
  includeSrc: false,
  transform(raw) {
    return {
      posts: raw
        .filter((p) => p.frontmatter.title && p.url !== '/blog/')
        .map((p) => ({
          title: p.frontmatter.title as string,
          date: p.frontmatter.date as string,
          author: (p.frontmatter.author as string) || 'OIML SMART team',
          summary: (p.frontmatter.summary as string) || '',
          url: p.url,
          excerpt: p.excerpt || '',
        }))
        .sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    }
  },
})
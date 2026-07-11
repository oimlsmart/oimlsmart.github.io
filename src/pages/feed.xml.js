import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import SITE from '../data/site-meta'

export async function GET(context) {
  const posts = (await getCollection('blog'))
    .sort((a, b) => +new Date(b.data.date) - +new Date(a.data.date))

  return rss({
    title: SITE.feedTitle,
    description: SITE.feedDescription,
    site: context.site,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.summary,
      author: post.data.author,
      link: `/blog/${post.id.replace(/\.mdx$/, '')}/`,
    })),
  })
}
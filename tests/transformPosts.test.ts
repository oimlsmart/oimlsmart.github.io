import { describe, expect, it } from 'vitest'
import { transformPosts } from '../blog/posts'

describe('transformPosts', () => {
  it('filters out the blog index page', () => {
    const raw = [
      { url: '/blog/', frontmatter: { title: 'Index' } },
      { url: '/blog/post-1.html', frontmatter: { title: 'Post 1', date: '2026-07-01' } },
    ]
    const result = transformPosts(raw as any)
    expect(result).toHaveLength(1)
    expect(result[0].url).toBe('/blog/post-1.html')
  })

  it('filters out entries without title or date', () => {
    const raw = [
      { url: '/blog/a.html', frontmatter: { title: 'A' } },
      { url: '/blog/b.html', frontmatter: { date: '2026-07-01' } },
      { url: '/blog/c.html', frontmatter: { title: 'C', date: '2026-07-01' } },
    ]
    const result = transformPosts(raw as any)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('C')
  })

  it('sorts newest-first by date', () => {
    const raw = [
      { url: '/blog/old.html', frontmatter: { title: 'Old', date: '2026-01-01' } },
      { url: '/blog/new.html', frontmatter: { title: 'New', date: '2026-12-01' } },
    ]
    const result = transformPosts(raw as any)
    expect(result[0].title).toBe('New')
    expect(result[1].title).toBe('Old')
  })

  it('defaults author to "OIML SMART team" when missing', () => {
    const raw = [
      { url: '/blog/a.html', frontmatter: { title: 'A', date: '2026-07-01' } },
    ]
    const result = transformPosts(raw as any)
    expect(result[0].author).toBe('OIML SMART team')
  })

  it('defaults summary to empty string when missing', () => {
    const raw = [
      { url: '/blog/a.html', frontmatter: { title: 'A', date: '2026-07-01' } },
    ]
    const result = transformPosts(raw as any)
    expect(result[0].summary).toBe('')
  })

  it('preserves author and summary when provided', () => {
    const raw = [
      {
        url: '/blog/a.html',
        frontmatter: {
          title: 'A',
          date: '2026-07-01',
          author: 'Custom Author',
          summary: 'A short summary.',
        },
      },
    ]
    const result = transformPosts(raw as any)
    expect(result[0].author).toBe('Custom Author')
    expect(result[0].summary).toBe('A short summary.')
  })
})
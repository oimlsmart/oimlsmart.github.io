<script setup lang="ts">
import { data } from './posts.data'

const posts = data.posts
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<PageHero
  eyebrow="Blog · Internal pilot feed"
  title="OIML SMART pilot — updates"
  lede="Working notes and milestone snapshots from the OIML SMART pilot programme. Draft content for the OIML SMART team and OIML Member State reviewers."
/>

<DraftCallout />

<div class="blog-list">
  <article v-for="post in posts" :key="post.url" class="blog-entry">
    <div class="blog-meta">
      <time>{{ formatDate(post.date) }}</time>
      <span class="blog-author">{{ post.author }}</span>
    </div>
    <h2>
      <a :href="post.url">{{ post.title }}</a>
    </h2>
    <p>{{ post.summary }}</p>
    <a class="blog-read" :href="post.url">Read →</a>
  </article>
</div>

<style scoped>
.blog-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 2rem 0;
}

.blog-entry {
  padding: 1.75rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  position: relative;
  transition: border-color 0.2s, transform 0.2s;
}

.blog-entry:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
}

.blog-meta {
  display: flex;
  gap: 1rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin-bottom: 0.75rem;
  align-items: center;
}

.blog-meta time {
  letter-spacing: 0.05em;
}

.blog-entry h2 {
  font-family: var(--vp-font-family-serif);
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 0.5rem;
  border: none;
  padding: 0;
}

.blog-entry h2 a {
  text-decoration: none;
  color: var(--vp-c-text-1);
}

.blog-entry h2 a:hover {
  color: var(--vp-c-brand-1);
}

.blog-entry p {
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  margin: 0 0 1rem;
}

.blog-read {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 500;
}

.blog-read:hover {
  text-decoration: underline;
}
</style>
<script setup lang="ts">
// Static banner — no script logic. The DRAFT/Pilot/external-use wording
// lives in `.vitepress/data/site.ts > draftNotice` if you want to reuse
// the text elsewhere; this component is intentionally inline because it
// has its own visual treatment (warning stripes) that differs from
// DraftCallout.
</script>

<template>
  <!-- Persistent DRAFT/INTERNAL banner at the very top of every page -->
  <div class="internal-banner">
    <div class="internal-banner-inner">
      <span class="badge">DRAFT</span>
      <span class="text">
        OIML SMART pilot programme &middot; internal use only &middot; all documents and specifications are drafts and may change without notice
      </span>
    </div>
  </div>
</template>

<style scoped>
.internal-banner {
  position: relative;
  z-index: 1;
  background: repeating-linear-gradient(
    45deg,
    #fffbeb,
    #fffbeb 10px,
    #fef3c7 10px,
    #fef3c7 20px
  );
  border-bottom: 1px solid #d97706;
  padding: 0.625rem 1rem;
  font-family: var(--vp-font-family-base);
  font-size: 0.75rem;
  line-height: 1.4;
  color: #78350f;
}

.dark .internal-banner {
  background: repeating-linear-gradient(
    45deg,
    #1f2937,
    #1f2937 10px,
    #111827 10px,
    #111827 20px
  );
  border-bottom-color: #d97706;
  color: #fde68a;
}

.internal-banner-inner {
  max-width: 80rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  text-align: center;
}

.badge {
  flex-shrink: 0;
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: #d97706;
  color: white;
  font-family: var(--vp-font-family-mono);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  border-radius: 2px;
}

.text {
  font-weight: 500;
}

@media (max-width: 640px) {
  .internal-banner {
    font-size: 0.6875rem;
    padding: 0.4rem 0.75rem;
  }
}
</style>
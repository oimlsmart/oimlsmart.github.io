<script setup lang="ts">
const loading = false
</script>
<template>
  <div class="max-w-[900px] mx-auto py-8 px-6 font-sans text-ink">
    <h1 class="text-[1.75rem] mb-6">Certificates</h1>
    <p class="text-center py-8 text-ink-muted italic">No certificates issued yet. Certificates are generated when an evaluation report is finalized as APPROVED.</p>
    <div class="border border-dashed border-rule rounded p-6 bg-paper">
      <h3 class="text-sm mb-2 text-ink-soft">Certificate (future)</h3>
      <p class="text-xs text-ink-muted leading-relaxed">Once the IA finalizes an evaluation as APPROVED, an OIML certificate will appear here with: certificate number, type designation, accuracy class, nLC, Emax, vmin, pLC, and the issuing authority.</p>
    </div>
    <nav class="mt-8 pt-4 border-t border-rule"><a href="/app/" class="text-sm text-accent">← Back</a></nav>
  </div>
</template>

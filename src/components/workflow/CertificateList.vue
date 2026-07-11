<script setup lang="ts">
import { ref, onMounted } from 'vue'
// Certificate list — uses a separate store if certificates are seeded
// For now, shows a placeholder with the expected certificate shape
const loading = ref(false)
</script>
<template>
  <div class="page">
    <header><h1>Certificates</h1></header>
    <p class="empty">No certificates issued yet. Certificates are generated when an evaluation report is finalized as APPROVED.</p>
    <div class="card placeholder">
      <h3>Certificate (future)</h3>
      <p>Once the IA finalizes an evaluation as APPROVED, an OIML certificate will appear here with:
      certificate number, type designation, accuracy class, nLC, Emax, vmin, pLC, and the issuing authority.</p>
    </div>
    <nav class="back"><a href="/app/">← Back</a></nav>
  </div>
</template>
<style scoped>
.page{max-width:900px;margin:0 auto;padding:2rem 1.5rem;font-family:system-ui,sans-serif;color:#1a1a1a}
h1{font-size:1.75rem;margin:0 0 1.5rem}
.empty{text-align:center;padding:2rem;color:#999;font-style:italic}
.placeholder{border:1px dashed #ccc;border-radius:4px;padding:1.5rem;background:#fafafa}
.placeholder h3{font-size:.9rem;margin:0 0 .5rem;color:#666}
.placeholder p{font-size:.8rem;color:#999;line-height:1.5}
a{color:#004996}
.back{margin-top:2rem;padding-top:1rem;border-top:1px solid #e0e0e0}
</style>

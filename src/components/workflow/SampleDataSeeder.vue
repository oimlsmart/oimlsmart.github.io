<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSampleData } from '../../lib/useSampleData'

const { seedIfNeeded, reseed, isSeeded } = useSampleData()
const seeding = ref(false)
const seeded = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  seeding.value = true
  try {
    await seedIfNeeded()
    seeded.value = isSeeded()
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    seeding.value = false
  }
})

async function handleReseed() {
  seeding.value = true
  error.value = null
  try {
    await reseed()
    seeded.value = true
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    seeding.value = false
  }
}
</script>

<template>
  <div v-if="seeding" class="seeder-status">
    Loading demo data…
  </div>
  <div v-else-if="error" class="seeder-error">
    Demo data error: {{ error }}
    <button @click="handleReseed" class="reseed-btn">Retry</button>
  </div>
  <div v-else-if="seeded" class="seeder-done">
    <button @click="handleReseed" class="reseed-btn" title="Reset all demo data">
      ↻ Reset demo data
    </button>
  </div>
</template>

<style scoped>
.seeder-status {
  position: fixed; top: 0; left: 0; right: 0;
  background: rgb(0 73 150 / 0.95); color: #fff;
  padding: 0.5rem 1rem; font-size: 0.75rem;
  text-align: center; z-index: 999;
  font-family: var(--vp-font-family-mono, monospace);
}
.seeder-error {
  position: fixed; top: 0; left: 0; right: 0;
  background: rgb(239 68 68 / 0.95); color: #fff;
  padding: 0.5rem 1rem; font-size: 0.75rem;
  display: flex; justify-content: center; align-items: center; gap: 0.5rem;
  z-index: 999;
}
.seeder-done {
  position: fixed; bottom: 1rem; right: 1rem;
  z-index: 100;
}
.reseed-btn {
  font-size: 0.6875rem; padding: 2px 8px;
  background: rgb(255 255 255 / 0.2); color: inherit;
  border: 1px solid rgb(255 255 255 / 0.3); border-radius: 2px;
  cursor: pointer;
}
.reseed-btn:hover { background: rgb(255 255 255 / 0.3); }
</style>

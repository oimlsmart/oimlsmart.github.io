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
  <div v-if="seeding" class="fixed top-0 left-0 right-0 bg-accent/95 text-white py-2 px-4 text-xs text-center z-[999] font-mono">
    Loading demo data…
  </div>
  <div v-else-if="error" class="fixed top-0 left-0 right-0 bg-[#ef4444]/95 text-white py-2 px-4 text-xs flex justify-center items-center gap-2 z-[999]">
    Demo data error: {{ error }}
    <button @click="handleReseed" class="text-[0.6875rem] py-0.5 px-2 bg-white/20 text-inherit border border-white/30 rounded-sm cursor-pointer hover:bg-white/30">Retry</button>
  </div>
  <div v-else-if="seeded" class="fixed bottom-4 right-4 z-[100]">
    <button @click="handleReseed" class="text-[0.6875rem] py-0.5 px-2 bg-white/20 text-ink border border-rule rounded-sm cursor-pointer hover:bg-paper-raised" title="Reset all demo data">
      ↻ Reset demo data
    </button>
  </div>
</template>

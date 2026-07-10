<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isOpen = ref(false)
const root = ref<HTMLElement | null>(null)

function toggle() {
  isOpen.value = !isOpen.value
}

function handleClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

const links = [
  { href: '/about/what-is-smart', label: 'What is OIML SMART?' },
  { href: '/about/why-smart', label: 'Why SMART' },
  { href: '/about/how-it-works', label: 'How It Works' },
  { href: '/about/technology', label: 'Technology' },
  { href: '/about/contact', label: 'Contact' },
  { href: '/about/branding', label: 'Branding' },
]
</script>

<template>
  <div ref="root" class="nav-dropdown relative">
    <button
      class="dropdown-trigger bg-transparent border-none cursor-pointer text-sm font-medium text-ink-soft hover:text-accent flex items-center gap-1 whitespace-nowrap transition-colors"
      @click="toggle"
    >
      About <span class="text-[0.625rem]">▾</span>
    </button>
    <div
      class="dropdown-panel absolute top-full left-0 mt-2 min-w-[220px] bg-paper-soft border border-rule rounded-lg p-1.5 shadow-lg flex-col gap-0.5 z-[200] transition-all duration-150"
      :class="isOpen ? 'flex opacity-100 visible translate-y-0' : 'hidden opacity-0 invisible'"
    >
      <a
        v-for="link in links"
        :key="link.href"
        :href="link.href"
        class="block px-3 py-2 rounded text-sm text-ink-soft no-underline hover:bg-paper-raised hover:text-accent transition-colors"
      >
        {{ link.label }}
      </a>
    </div>
  </div>
</template>
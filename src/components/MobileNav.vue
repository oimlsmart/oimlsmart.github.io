<script setup lang="ts">
import { ref } from 'vue'
import { NAV_DROPDOWNS, NAV_STANDALONE } from '../data/nav-config'

const isOpen = ref(false)
const expandedSection = ref<string | null>(null)

function toggleMenu() {
  isOpen.value = !isOpen.value
  document.body.style.overflow = isOpen.value ? 'hidden' : ''
}

function toggleSection(id: string) {
  expandedSection.value = expandedSection.value === id ? null : id
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark')
  localStorage.setItem('oiml-theme', isDark ? 'dark' : 'light')
}
</script>

<template>
  <!-- Hamburger trigger button (in header) -->
  <button
    class="md:hidden flex flex-col items-center justify-center gap-[5px] w-11 h-11 rounded-lg border border-rule cursor-pointer shrink-0 transition-colors hover:border-accent bg-transparent"
    @click="toggleMenu"
    aria-label="Open menu"
  >
    <span class="block w-5 h-0.5 rounded-full bg-ink transition-all duration-200" :class="{ 'translate-y-[7px] rotate-45': isOpen }"></span>
    <span class="block w-5 h-0.5 rounded-full bg-ink transition-all duration-200" :class="{ 'opacity-0': isOpen }"></span>
    <span class="block w-5 h-0.5 rounded-full bg-ink transition-all duration-200" :class="{ '-translate-y-[7px] -rotate-45': isOpen }"></span>
  </button>

  <!-- Full-screen mobile nav overlay -->
  <Transition name="mobile-nav">
      <div v-if="isOpen" class="fixed inset-0 z-[300] bg-paper flex flex-col md:hidden">
        <!-- Panel header -->
        <div class="flex items-center justify-between h-14 px-6 border-b border-rule shrink-0">
          <a href="/" class="font-serif text-base font-semibold tracking-tight text-ink" @click="toggleMenu">OIML SMART</a>
          <button
            class="flex items-center justify-center w-11 h-11 rounded-lg border border-rule cursor-pointer shrink-0 transition-colors hover:border-accent bg-transparent"
            @click="toggleMenu"
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="text-ink">
              <path d="M5 5 L15 15 M15 5 L5 15" />
            </svg>
          </button>
        </div>

        <!-- Nav items -->
        <div class="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-1">
          <!-- Dropdown sections (expandable) -->
          <div v-for="dropdown in NAV_DROPDOWNS" :key="dropdown.id">
            <!-- Section header (internal gets amber accent) -->
            <button
              v-if="dropdown.variant === 'internal'"
              class="w-full flex items-center gap-2 py-3 px-3 text-sm font-medium text-ink-soft hover:text-accent transition-colors text-left rounded"
              @click="toggleSection(dropdown.id)"
            >
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-amber-warm shrink-0"></span>
              <span class="flex-1">{{ dropdown.label }}</span>
              <span class="text-xs text-ink-muted transition-transform" :class="{ 'rotate-180': expandedSection === dropdown.id }">▾</span>
            </button>
            <button
              v-else
              class="w-full flex items-center justify-between py-3 px-3 text-sm font-medium text-ink-soft hover:text-accent transition-colors text-left rounded"
              @click="toggleSection(dropdown.id)"
            >
              <span>{{ dropdown.label }}</span>
              <span class="text-xs text-ink-muted transition-transform" :class="{ 'rotate-180': expandedSection === dropdown.id }">▾</span>
            </button>

            <!-- Expandable links -->
            <Transition name="expand">
              <div v-if="expandedSection === dropdown.id" class="flex flex-col gap-0 pb-2">
                <!-- Section header for internal -->
                <div v-if="dropdown.sectionHeader" class="px-3 py-2 text-[0.625rem] font-mono uppercase tracking-wider text-amber-deep">
                  {{ dropdown.sectionHeader }}
                </div>
                <a
                  v-for="link in dropdown.links"
                  :key="link.href"
                  :href="link.href"
                  class="py-2.5 px-6 text-sm text-ink-soft hover:text-accent transition-colors rounded no-decoration"
                >
                  {{ link.label }}
                  <span v-if="link.badge === 'internal'" class="ml-2 text-[0.5625rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-warm/10 text-amber-deep border border-amber-warm/20">internal</span>
                </a>
              </div>
            </Transition>
          </div>

          <!-- Horizontal divider before standalone links -->
          <div class="h-px bg-rule my-2"></div>

          <!-- Standalone links -->
          <a
            v-for="link in NAV_STANDALONE"
            :key="link.href"
            :href="link.href"
            class="py-3 px-3 text-sm font-medium text-ink-soft hover:text-accent transition-colors rounded"
          >{{ link.label }}</a>

          <!-- Blog -->
          <a href="/blog/" class="py-3 px-3 text-sm font-medium text-ink-soft hover:text-accent transition-colors rounded">Blog</a>

          <!-- Bottom: theme toggle + sign in -->
          <div class="mt-auto pt-4 border-t border-rule flex items-center justify-between">
            <button
              class="flex items-center gap-2 py-2 px-3 text-sm font-medium text-ink-soft hover:text-accent transition-colors rounded"
              @click="toggleTheme"
            >
              <span>Toggle theme</span>
            </button>
            <a href="/login/" class="text-sm font-semibold text-accent">Sign in ↗</a>
          </div>
        </div>
      </div>
    </Transition>
</template>

<style scoped>
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: transform 0.25s ease;
}
.mobile-nav-enter-from,
.mobile-nav-leave-to {
  transform: translateX(100%);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>

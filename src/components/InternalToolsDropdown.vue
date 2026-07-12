<script setup lang="ts">
/**
 * InternalToolsDropdown — OIML-internal portal links.
 *
 * Visually distinct from the main nav: amber accent signals
 * "internal use only". Each item carries an [internal] chip.
 * Uses the shared useClickOutside composable.
 */
import { useClickOutside } from '../composables/useClickOutside'
const { root, isOpen, toggle } = useClickOutside()

const links = [
  { href: '/concepts-management/', label: 'Concepts Management', desc: 'Term-usage registry' },
]
</script>

<template>
  <div ref="root" class="relative flex items-center">
    <div class="hidden sm:block w-px h-5 bg-rule mr-3" aria-hidden="true" />
    <button
      class="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-accent whitespace-nowrap transition-colors"
      @click="toggle" data-testid="internal-dropdown-trigger"
      :aria-label="`Internal tools — ${links.length} item${links.length > 1 ? 's' : ''}`"
      :aria-expanded="isOpen"
    >
      <span class="inline-block w-1.5 h-1.5 rounded-full bg-amber-warm" aria-hidden="true" />
      <span>Internal</span>
      <span class="text-[0.625rem] text-ink-muted">▾</span>
    </button>
    <div
      class="absolute top-full right-0 mt-2 min-w-[260px] bg-paper-soft border border-rule rounded-lg p-1.5 shadow-lg flex-col gap-0.5 z-[200] transition-all duration-150"
      :data-testid="'internal-dropdown-panel'"
      :class="isOpen ? 'flex opacity-100 visible translate-y-0' : 'hidden opacity-0 invisible'"
    >
      <div class="px-3 py-1.5 text-[0.625rem] font-mono uppercase tracking-wider text-amber-deep border-b border-rule-soft mb-1">
        OIML internal use only
      </div>
      <a
        v-for="link in links"
        :key="link.href"
        :href="link.href"
        class="flex items-start gap-2 px-3 py-2 rounded text-sm text-ink-soft no-underline hover:bg-paper-raised hover:text-accent transition-colors"
      >
        <div class="flex flex-col gap-0.5 flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span>{{ link.label }}</span>
            <span class="shrink-0 inline-flex items-center text-[0.5625rem] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-warm/10 text-amber-deep border border-amber-warm/20">internal</span>
          </div>
          <span class="text-xs text-ink-muted">{{ link.desc }}</span>
        </div>
      </a>
    </div>
  </div>
</template>

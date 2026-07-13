<script setup lang="ts">
/**
 * NavDropdown — generic navigation dropdown driven by NavDropdownConfig.
 *
 * Replaces the duplicated AboutDropdown / InternalToolsDropdown pattern.
 * Adding a new dropdown = adding a config entry, not creating a component.
 *
 * Variants:
 *   - default: standard nav styling
 *   - internal: amber accent, visual divider, "internal use" section header
 */
import { computed } from 'vue'
import { useClickOutside } from '../composables/useClickOutside'
import { isDropdownActive, isLinkActive, type NavDropdownConfig } from '../data/nav-config'

const props = defineProps<{
  config: NavDropdownConfig
  currentPath: string
}>()

const { root, isOpen, toggle } = useClickOutside()

const isInternal = computed(() => props.config.variant === 'internal')
const isActive = computed(() => isDropdownActive(props.config, props.currentPath))

function activeClass(href: string): string {
  return isLinkActive(href, props.currentPath) ? 'text-accent font-semibold' : ''
}
</script>

<template>
  <div ref="root" class="nav-dropdown relative flex items-center" @mouseenter="isOpen = true" @mouseleave="isOpen = false">
    <div v-if="isInternal" class="hidden sm:block w-px h-5 bg-rule mr-3" aria-hidden="true" />
    <button
      class="inline-flex items-center gap-1.5 text-sm font-medium transition-colors whitespace-nowrap"
      :class="isActive ? 'text-accent font-semibold' : 'text-ink-soft hover:text-accent'"
      @click="toggle"
      :data-testid="`nav-dropdown-${config.id}`"
      :aria-label="config.label"
      :aria-expanded="isOpen"
    >
      <span v-if="isInternal" class="inline-block w-1.5 h-1.5 rounded-full bg-amber-warm" aria-hidden="true" />
      <span>{{ config.label }}</span>
      <span class="text-[0.625rem] text-ink-muted">▾</span>
    </button>
    <div
      class="absolute top-full mt-2 min-w-[240px] bg-paper-soft border border-rule rounded-lg p-1.5 shadow-lg flex-col gap-0.5 z-[200] transition-all duration-150"
      :class="[
        isInternal ? 'right-0' : 'left-0',
        isOpen ? 'flex opacity-100 visible translate-y-0' : 'hidden opacity-0 invisible',
      ]"
    >
      <div
        v-if="config.sectionHeader"
        class="px-3 py-1.5 text-[0.625rem] font-mono uppercase tracking-wider text-amber-deep border-b border-rule-soft mb-1"
      >
        {{ config.sectionHeader }}
      </div>
      <a
        v-for="link in config.links"
        :key="link.href"
        :href="link.href"
        class="rounded no-underline transition-colors"
        :class="link.desc
          ? 'flex items-start gap-2 px-3 py-2 text-sm text-ink-soft hover:bg-paper-raised hover:text-accent'
          : 'block px-3 py-2 text-sm text-ink-soft hover:bg-paper-raised hover:text-accent'"
      >
        <div v-if="link.desc" class="flex flex-col gap-0.5 flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span>{{ link.label }}</span>
            <span
              v-if="link.badge === 'internal'"
              class="shrink-0 inline-flex items-center text-[0.5625rem] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-warm/10 text-amber-deep border border-amber-warm/20"
            >internal</span>
          </div>
          <span class="text-xs text-ink-muted">{{ link.desc }}</span>
        </div>
        <template v-else>
          <span>{{ link.label }}</span>
        </template>
      </a>
    </div>
  </div>
</template>

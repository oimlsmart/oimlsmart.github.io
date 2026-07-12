---
deprecated: true
---

<script setup lang="ts">
/**
 * InternalToolsDropdown — DEPRECATED.
 *
 * This component is preserved as a thin facade over NavDropdown.
 * New code should use NavDropdown with the 'internal' config from nav-config.ts.
 */
import NavDropdown from './NavDropdown.vue'
import { NAV_DROPDOWNS } from '../data/nav-config'

const internalConfig = NAV_DROPDOWNS.find(d => d.id === 'internal')!
</script>

<template>
  <NavDropdown :config="internalConfig" current-path="/" />
</template>

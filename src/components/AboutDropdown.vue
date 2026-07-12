---
deprecated: true
---

<script setup lang="ts">
/**
 * AboutDropdown — DEPRECATED.
 *
 * This component is preserved as a thin facade over NavDropdown.
 * New code should use NavDropdown with the 'about' config from nav-config.ts.
 */
import NavDropdown from './NavDropdown.vue'
import { NAV_DROPDOWNS } from '../data/nav-config'

const aboutConfig = NAV_DROPDOWNS.find(d => d.id === 'about')!
</script>

<template>
  <NavDropdown :config="aboutConfig" current-path="/" />
</template>

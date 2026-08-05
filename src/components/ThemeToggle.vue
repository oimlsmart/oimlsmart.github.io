<script setup lang="ts">
/** Wrapper — the island lives in @oimlsmart/site-shell (one chrome
 *  SSOT, TODO.FULL/02); attrs + slots forward. */
import Pkg from '@oimlsmart/site-shell/components/ThemeToggle.vue'
</script>

<template>
  <Pkg v-bind=""><slot /></Pkg>
</template>

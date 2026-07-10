<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
  document.body.classList.toggle('nav-open', isOpen.value)
}
</script>

<template>
  <button
    class="nav-hamburger flex md:hidden flex-col gap-1 bg-transparent border-none cursor-pointer p-2"
    @click="toggle"
    aria-label="Menu"
    :class="{ 'is-open': isOpen }"
  >
    <span class="block w-5 h-0.5 bg-ink transition-[transform,opacity] duration-200"></span>
    <span class="block w-5 h-0.5 bg-ink transition-[transform,opacity] duration-200"></span>
    <span class="block w-5 h-0.5 bg-ink transition-[transform,opacity] duration-200"></span>
  </button>
</template>

<style scoped>
.nav-hamburger.is-open span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}
.nav-hamburger.is-open span:nth-child(2) {
  opacity: 0;
}
.nav-hamburger.is-open span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}
</style>
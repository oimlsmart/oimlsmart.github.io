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
    class="nav-hamburger"
    @click="toggle"
    aria-label="Menu"
    :class="{ 'is-open': isOpen }"
  >
    <span></span>
    <span></span>
    <span></span>
  </button>
</template>

<style scoped>
.nav-hamburger {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}
.nav-hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--ink);
  transition: transform 0.2s, opacity 0.2s;
}
.nav-hamburger.is-open span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}
.nav-hamburger.is-open span:nth-child(2) {
  opacity: 0;
}
.nav-hamburger.is-open span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

@media (max-width: 768px) {
  .nav-hamburger {
    display: flex;
  }
}
</style>
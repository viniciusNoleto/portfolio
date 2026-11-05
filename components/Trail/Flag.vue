<template>
  <!-- Bandeiras simplificadas em 3:2, desenhadas em SVG (emoji de bandeira não aparece no Windows). -->
  <svg class="flag" viewBox="0 0 21 14" aria-hidden="true">
    <template v-if="code === 'pt'">
      <!-- Brasil -->
      <rect width="21" height="14" fill="#009b3a" />
      <polygon points="10.5,1.6 19.4,7 10.5,12.4 1.6,7" fill="#fedf00" />
      <circle cx="10.5" cy="7" r="3.6" fill="#002776" />
      <path d="M7 6.1 Q10.5 5.1 14 7.5" stroke="#fff" stroke-width=".7" fill="none" />
    </template>
    <template v-else-if="code === 'es'">
      <!-- México -->
      <rect width="7" height="14" fill="#006847" />
      <rect x="7" width="7" height="14" fill="#fff" />
      <rect x="14" width="7" height="14" fill="#ce1126" />
      <ellipse cx="10.5" cy="7" rx="1.9" ry="1.6" fill="#8c5a2b" />
      <path d="M8.6 8.2 Q10.5 9.8 12.4 8.2" stroke="#3c7a3c" stroke-width=".6" fill="none" />
    </template>
    <template v-else-if="code === 'en'">
      <!-- Estados Unidos: 13 listras e o cantão azul com estrelas -->
      <rect width="21" height="14" fill="#fff" />
      <rect v-for="k in 7" :key="k" y="0" :transform="`translate(0 ${(k - 1) * 28 / 13})`" width="21" :height="14 / 13" fill="#b22234" />
      <rect width="8.4" :height="98 / 13" fill="#3c3b6e" />
      <template v-for="r in 4" :key="`r${r}`">
        <circle v-for="c in 5" :key="c" :cx="0.85 + (c - 1) * 1.68 + (r % 2 ? 0 : 0.84)" :cy="0.95 + (r - 1) * 1.85" r=".32" fill="#fff" />
      </template>
    </template>
  </svg>
</template>

<script setup lang="ts">
  defineProps<{ code: string }>();
</script>

<style scoped>
  .flag { width: 21px; height: 14px; border-radius: 2px; box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18); }
</style>

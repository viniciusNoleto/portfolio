<template>
  <nav>
    <div
      class="cursor-pointer"
      @click="toggle"
    >
      <slot name="header" :open="open" />
    </div>

    <transition name="accordion-transition">
      <section v-show="open">
        <slot />
      </section>
    </transition>
  </nav>
</template>

<script lang="ts" setup>

  const open = defineModel('open', {
    type: Boolean,
    default: false
  });

  function toggle() {
    open.value = !open.value;
  }

</script>

<style scoped>

  .accordion-transition-enter-from {
    @apply max-h-0;
  }

  .accordion-transition-enter-active {
    @apply overflow-hidden transition-[max-height] duration-1000 ease-[cubic-bezier(0.42,0,0.58,1)];
  }

  .accordion-transition-enter-to {
    @apply max-h-[1000px];
  }

  .accordion-transition-leave-from {
    @apply max-h-[1000px];
  }

  .accordion-transition-leave-active {
    @apply overflow-hidden transition-[max-height] duration-[450ms] ease-[cubic-bezier(0,1,0,1)];
  }

  .accordion-transition-leave-to {
    @apply max-h-0;
  }

</style>
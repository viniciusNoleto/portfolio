<template>
  <section class="backdrop-blur-md border border-gray-500/80 rounded-md overflow-hidden">
    <div class="flex items-center gap-1 p-4 text-xl leading-none">
      <Icon
        name="material-symbols:bookmark-check-rounded"
        class="text-xl"
      />

      <div class="grow font-medium flex gap-4 items-center">
        {{ header }}

        <div class="center-flex gap-2">
          <slot name="icons" />
        </div>
      </div>
    </div>

    <slot />
  </section>
</template>

<script lang="ts" setup>

  defineProps({
    header: {
      type: String,
      default: undefined
    },
  });

</script>

<style scoped>

</style>
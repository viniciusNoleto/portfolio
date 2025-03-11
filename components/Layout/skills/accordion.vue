<template>
  <UtilsAccordion class="backdrop-blur-md border border-gray-500/50 rounded-md overflow-hidden">
    <template #header="{ open }">
      <div class="flex items-center gap-1 p-4 text-xl leading-none bg-gradient-to-br rounded-b hover:bg-gray-500/10 transition-colors duration-500">
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

        <Icon
          :name="open ? 'line-md:chevron-up' : 'line-md:chevron-down'"
          class="text-xl"
        />
      </div>
    </template>

    <slot />
  </UtilsAccordion>
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
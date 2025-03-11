<template>
  <div class="flex flex-col gap-y-0.5">
    <label>
      {{ label }}
    </label>

    <slot :invalid="invalid" />

    <div v-if="errors.length > 0" class="text-red-500 text-sm">
      <div v-for="error in errors" :key="error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

  const props = defineProps({
    label: {
      type: String,
      default: undefined
    },
    errors: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  });

  const invalid = computed(() => props.errors.length > 0);

</script>

<style scoped>

</style>
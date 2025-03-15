<template>
  <div class="flex flex-col gap-y-0.5">
    <label>
      {{ label }}
    </label>

    <slot :invalid="invalid" />

    <div class="text-red-500 text-sm">
      <transition-group name="move-fade-in">
        <div v-for="error in errors" :key="error">
          {{ error }}
        </div>
      </transition-group>
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

  .move-fade-in-enter-active, .move-fade-in-leave-active {
    transition: all 0.2s;
  }

  .move-fade-in-enter-from, .move-fade-in-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

</style>
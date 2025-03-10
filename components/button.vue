<template>
  <button
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script lang="ts" setup>

  const emit = defineEmits(['action']);

  const props = withDefaults(
    defineProps<{
      disabled?: boolean;
      loading?: boolean;
    }>(),
    {
      disabled: false,
      loading: false,
    }
  );

  function handleClick() {
    if (!props.disabled && !props.loading) emit('action');
  }

</script>

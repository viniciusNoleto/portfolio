<template>
  <button
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <slot
      v-if="!loading"
    />

    <Icon
      v-if="loading"
      name="svg-spinners:gooey-balls-2"
    />
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

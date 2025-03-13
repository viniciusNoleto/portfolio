<template>
  <slot :item="item" />
</template>

<script lang="ts" setup>

  defineProps<{
    item: any;
  }>();

</script>
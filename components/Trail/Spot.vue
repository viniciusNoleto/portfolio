<template>
  <section :id="id" class="spot" :class="`side-${sec.side}`" :data-z0="sec.z0" :style="style">
    <slot />
  </section>
</template>

<script setup lang="ts">
  // Uma faixa do mundo. A altura mínima é o tamanho da faixa em z (vezes --u) e a caixa de
  // texto entra na altura `panel` do layout, para ficar ao lado do lugar que ela descreve.
  import { section, sectionSpan } from '~/lib/world/layout.js';

  const props = defineProps<{ id: string }>();
  const sec = section(props.id)!;
  const style = {
    '--span': sectionSpan(props.id),
    '--off': sec.panel == null ? 0 : sec.panel - sec.z0,
  };
</script>

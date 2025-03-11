<template>
  <div
    ref="blobsContainer"
    class="absolute inset-0 overflow-hidden pointer-events-none"
  >
    <div
      v-for="blob in blobs"
      :key="blob.id"
      class="bg-primary-500/15 blur-2xl z-[-1]"
      :class="`floating-blob blob-${blob.id}`"
      :style="{
        width: blob.size + 'px',
        height: blob.size + 'px',
        transform: `translate(${blob.x}px, ${blob.y}px) rotate(${blob.rotate}deg)`,
        borderRadius: blob.borderRadius
      }"
    ></div>
  </div>
</template>

<script setup>

  import gsap from "gsap";

  const numBlobs = 8;

  const blobs = ref([]);

  const blobsContainer = ref();

  const blobsContainerSizes = toRef(useElementSize(blobsContainer));

  function getBorderRadius(idx) {
    return [
      '60% 40% 30% 70% / 100% 85% 92% 74%',
      '20% 71% 47% 70% / 81% 15% 22% 54%',
      '20% 71% 47% 70% / 81% 15% 22% 54%',
      '100% 75% 92% 74% / 60% 80% 30% 70%',
    ][idx ?? 0];
  };

  function moveBlob(blob) {
    blob.idx = ((blob.idx ?? 0) + 1) % 4;

    gsap.to(blob, {
      x: Math.random() * blobsContainerSizes.value.width,
      y: Math.random() * blobsContainerSizes.value.height,
      rotate: Math.random() * 360,
      duration: Math.random() * 5 + 3,
      ease: "power2.inOut",
      borderRadius: getBorderRadius(blob.idx),
      onComplete: () => moveBlob(blob),
    });
  };

  onMounted(() => {
    for (let i = 0; i < numBlobs; i++) {
      blobs.value.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 150 + 300,
        rotate: Math.random() * 360,
        idx: i,
        borderRadius: getBorderRadius(0)
      });
    }

    blobs.value.forEach(moveBlob);
  });

</script>

<style scoped>

  .floating-blob {
    position: absolute;
    transition: transform 0.2s linear;
  }

</style>

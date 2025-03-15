<template>
  <section class="relative center-flex px-6">
    <StyleStainWrapper class="top-1/2 right-0">
      <StyleStainCore class="h-[100vh] from-blue-500/10" />
    </StyleStainWrapper>

    <section class="max-w-[60rem] w-full flex flex-col gap-8">
      <div class="flex flex-col items-center gap-1 leading-none">
        <span class="text-3xl font-bold">
          Qualificações
        </span>
  
        <div class="center-flex gap-1 text-sm font-thin">
          Tudo que fiz e aprendi na minha carreira
        </div>
      </div>

      <div class="center-flex">
        <div class="w-fit grid auto-cols-fr grid-flow-col gap-2">
          <NoletoButton
            v-for="button in [
              {
                label: 'Trabalhos',
                value: 'works',
                icon: 'uil-briefcase'
              },
              {
                label: 'Certificados',
                value: 'certificates',
                icon: 'uil-award'
              },
              {
                label: 'Projetos',
                value: 'projects',
                icon: 'majesticons:sitemap-line'
              }
            ]"
            class="bg-primary-500 rounded-md center-flex gap-1.5 p-2 px-3 text-white font-bold transition-all duration-500 hover:text-primary-500 hover:bg-primary-500/10"
            @action="selected = (button.value as any)"
          >
            <Icon
              :name="button.icon"
              class="text-2xl"
            />
  
            {{ button.label }}
          </NoletoButton>
        </div>
      </div>

      <section class="flex flex-col gap-6">
        <transition name="fade-side">
          <PrimeVueTimeline
            :value="info"
            align="alternate"
          >
            <template #content="{ item, index }">
              <div class="flex flex-col gap-2 pb-4">
                <span
                  v-text="item.title"
                  class="text-lg font-bold"
                />
    
                <span
                  v-if="item.company"
                  v-text="item.company"
                  class="text-xs font-medium"
                />
    
                <p
                  v-if="item.description"
                  v-html="item.description"
                  class="text-sm"
                />

                <a
                  v-if="item.link"
                  :href="item.link"
                  target="_blank"
                  class="flex items-center gap-0.5 text-sm font-semibold text-primary-500"
                  :class="index % 2 === 0 ? 'justify-start' : 'justify-end'"
                >
                  <Icon name="uil-link" class="text-md" />
                  ver mais
                </a>

                <div
                  v-if="item.date"
                  class="flex items-center gap-1 text-xs font-semibold"
                  :class="index % 2 === 0 ? 'justify-start' : 'justify-end'"
                >
                  <Icon
                    name="material-symbols:calendar-month-rounded"
                    class="text-md"
                  />

                  {{ item.date }}
                </div>
              </div>
            </template>
          </PrimeVueTimeline>
        </transition>
      </section>
    </section>
  </section>
</template>

<script lang="ts" setup>

  import PrimeVueTimeline from 'primevue/timeline';
  import workJson from '~/app/info/data/works.json';
  import certificatesJson from '~/app/info/data/certificates.json';
  import projectsJson from '~/app/info/data/projects.json';


  const worksHistory = ref(workJson);

  const certificatesHistory = ref(certificatesJson);

  const projectsHistory = ref(projectsJson);


  const selected = useLocalStorage<'works'|'certificates'|'projects'>('selectedInfo', 'works');

  const info = computed(() => {
    if (selected.value === 'works') return worksHistory.value;
    if (selected.value === 'certificates') return certificatesHistory.value;
    if (selected.value === 'projects') return projectsHistory.value;
    return [];
  });

</script>

<style scoped>

</style>
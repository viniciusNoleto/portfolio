<template>
  <section class="relative center-flex px-6">
    <StyleStainWrapper class="top-1/2 left-0">
      <StyleStainCore class="h-[100vh] from-purple-500/20" />
    </StyleStainWrapper>

    <section class="max-w-[60rem] w-full flex flex-col gap-8">
      <div class="flex flex-col items-center gap-1 leading-none">
        <span class="text-3xl font-bold">
          Habilidades
        </span>
  
        <div class="center-flex gap-1 text-sm font-thin">
          Um pouco do que eu sei fazer
        </div>
      </div>

      <section class="flex flex-col gap-6">
        <LayoutSkillsAccordion header="Validação de formulários">
          <template #icons>
            <Icon name="skill-icons:vuejs-light" />
            <Icon name="skill-icons:typescript" />
            <div class="rounded-lg text-sm h-5 w-5 center-flex bg-[#f4f2ee] text-emerald-500">
              <Icon name="simple-icons:primevue" />
            </div>
          </template>
  
          <section class="flex flex-col px-3 pb-3 pt-2 gap-4">
            <div>
              Nas aplicaçãoes que desenvolvo crio validações de formulários em tempo real, garantindo que o usuário saiba o que está fazendo de errado e o que precisa ser corrigido.
              Isso se deve ao uso da biblioteca de validação <i>Yup</i>, que permite criar validações complexas de forma simples e legível.
            </div>
  
            <div class="p-6 border border-primary-400 rounded-md">
              <Input
                v-slot="{ invalid }"
                label="Exemplo de validação numérica"
                :errors="errors.number"
              >
                <InputNumber
                  v-model="number"
                  allow-empty
                  placeholder="Valor aceito: 0 a 10"
                  :invalid="invalid"
                  @input="validate"
                />
              </Input>
            </div>
          </section>
        </LayoutSkillsAccordion>

        <LayoutSkillsAccordion header="Comunicação com API">
          <template #icons>
            <Icon name="skill-icons:nuxtjs-light" />
          </template>

          <section class="flex flex-col px-3 pb-3 pt-2 gap-4">
            <div>
              Para obter e enviar dados para um servidor, utilizo a biblioteca <i>Axios</i> para realizar requisições HTTP e a linguagem de consulta <i>GraphQL</i> para obter dados de forma eficiente.
              Além disso, utilizo o framework <i>Nuxt.js</i> para criar aplicações com SSR e SSG, o que melhora a experiência do usuário e o SEO.
            </div>
          </section>
        </LayoutSkillsAccordion>
      </section>
    </section>
  </section>
</template>

<script lang="ts" setup>

  import type { ValidationError } from 'yup';


  // Validation

  const number = ref<number>();

  const rules = yup.object().shape({
    number: yup.number().required().min(0).max(10)
  });

  const errors = ref<Record<string, string[]>>({});

  function validate() {
    errors.value = {};

    rules.validate({ number: number.value }, { abortEarly: false }).catch((error: ValidationError) => {
      error.inner.forEach((innerError) => {
        if (innerError.path) errors.value[innerError.path] = innerError.errors;
      });
    });
  };


  // API communication

</script>

<style scoped>

  .animate-roll {
    animation: roll 2s infinite cubic-bezier(0.455, 0.03, 0.515, 0.955);
  }

  @keyframes roll {
    0%,100% {
      transform: translateX(0rem) rotate(0deg);
    }
    50% {
      transform: translateX(1.5rem) rotate(1080deg);
    }
  }

</style>
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
            <div class="rounded text-sm h-5 w-5 center-flex bg-[#f4f2ee] text-emerald-500">
              <Icon
                name="simple-icons:primevue"
                class="ml-0.5"
              />
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

        <LayoutSkillsAccordion
          header="Comunicação com API"
        >
          <template #icons>
            <Icon name="skill-icons:nuxtjs-light" />
          </template>

          <section class="flex flex-col px-3 pb-3 pt-2 gap-4">
            <div>
              Para obter informações de uma API, utilizo o <i>Nuxt</i> e o <i>fetch</i> para realizar requisições HTTP.
              Com isso, consigo buscar dados de forma assíncrona e exibi-los na tela, como no exemplo abaixo.
            </div>

            <div class="flex flex-col gap-4 p-6 border border-primary-400 rounded-md">
              <div class="flex justify-end">
                <Button
                  class="bg-gradient-to-br from-primary-400 to-primary-700 hover:ring ring-primary-400/50 transition-all duration-500 text-white w-fit center-flex p-2.5 gap-1 rounded-lg leading-none text-sm"
                  @action="randomProduct"
                >
                  <Icon name="uil-refresh" /> Buscar
                </Button>
              </div>

              <div
                v-if="loadingProduct"
                class="center-flex"
              >
                <Icon
                  name="svg-spinners:gooey-balls-2"
                  class="text-4xl text-primary-500"
                />
              </div>

              <div
                v-else
                class="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 flex flex-col gap-2"
              >
                <div class="flex gap-4">
                  <div class="max-w-[25%] overflow-hidden rounded-md center-flex">
                    <NuxtImg :src="product?.image" />
                  </div>

                  <div class="grow flex flex-col gap-2">
                    <div class="flex justify-between gap-4">
                      <div class="text-xl font-semibold">
                        {{ product?.title }}, <u class="decoration-primary-500 decoration-2">{{ product?.price }}$</u>
                      </div>
    
                      <div class="bg-primary-500 text-white font-bold rounded-full text-xs h-6 px-2 leading-none center-flex whitespace-nowrap w-max">
                        {{ product?.category }}
                      </div>
                    </div>

                    <span>
                      {{ product?.description }}
                    </span>

                    <div class="flex gap-1 text-xl">
                      <UtilsItemSlot
                        v-slot="{ item }"
                        :item="{
                          actives: Math.floor(product?.rating?.rate || 0),
                          disableds: 5 - Math.floor(product?.rating?.rate || 0)
                        }"
                      >
                        <template v-if="item.actives">
                          <Icon
                            v-for="i in item.actives"
                            name="ic:round-star-rate"
                          />
                        </template>
                        
                        <template v-if="item.disableds">
                          <Icon
                            v-for="i in item.disableds"
                            name="ic:round-star-rate"
                            class="opacity-50"
                          />
                        </template>
                      </UtilsItemSlot>

                      <span class="text-xs font-semibold ml-1">
                        ({{ product?.rating?.count }} avaliações)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </LayoutSkillsAccordion>
      </section>
    </section>
  </section>
</template>

<script lang="ts" setup>

  import type { ValidationError } from 'yup';

  // Utils

  type ReactiveData<T> = Ref<T>|(() => T);

  function useReactiveData<T>(data: ReactiveData<T>) {
    return typeof data === 'function' ? data() : data.value
  }



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

  type CommunicateOptions = {
    url: ReactiveData<string>;
    params?: ReactiveData<object>;
  } & (
    { method: 'GET', body?: never } |
    { method: 'POST' | 'PUT' | 'DELETE', body: ReactiveData<object> }
  );

  function communicate({
    url,
    method,
    body,
    params,
  }: CommunicateOptions) {

    const data = ref();
    const errors = ref<Record<string, string[]>>({});
    const loading = ref<boolean>(false);

    function request() {
      loading.value = true;

      $fetch(useReactiveData(url), {
        method,
        body: body ? useReactiveData(body) : undefined,
        params: params ? useReactiveData(params) : undefined,
      }).then((response) => data.value = response)
      .catch((response) => errors.value = response.errors)
      .finally(() => loading.value = false);
    }

    return {
      loading,
      data,
      request,
    };
  }

  const product_id = ref(1);

  const {
    data: product,
    loading: loadingProduct,
    request: requestProduct,
  } = communicate({
    url: () => `https://fakestoreapi.com/products/${product_id.value}`,
    method: 'GET',
  });

  onMounted(requestProduct);
  
  function randomProduct() {
    product_id.value = Math.floor(Math.random() * 20) + 1;
    requestProduct();
  }

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
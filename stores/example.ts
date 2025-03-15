import { defineStore } from 'pinia'

export const useExampleStore = defineStore('exampleStore', () => {

  const name = ref();

  return {
    name,
  };

})

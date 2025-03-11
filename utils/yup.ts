import * as yup from 'yup';

yup.setLocale({
  mixed: {
    default: 'Campo inválido',
    required: 'Campo obrigatório',
    notNull: 'Campo não pode ser nulo',
    defined: 'Campo deve estar definido',
    notType: 'Tipo inválido',
    oneOf: ({ values }: { values: any }) => `Deve ser um dos seguintes valores: ${values.join(', ')}`,
    notOneOf: ({ values }: { values: any }) => `Não pode ser um dos seguintes valores: ${values.join(', ')}`,
  },
  string: {
    length: ({ length }: { length: number }) => `Deve ter exatamente ${length} caracteres`,
    min: ({ min }: { min: number }) => `Deve ter no mínimo ${min} caracteres`,
    max: ({ max }: { max: number }) => `Deve ter no máximo ${max} caracteres`,
    matches: 'Formato inválido',
    email: 'Deve ser um endereço de e-mail válido',
    url: 'Deve ser uma URL válida',
    uuid: 'Deve ser um UUID válido',
    datetime: 'Deve ser uma data e hora válida',
    datetime_offset: 'Deve ser uma data e hora com fuso horário válido',
    datetime_precision: ({ precision }: { precision: number }) => `Deve ter precisão de até ${precision} casas decimais`,
    trim: 'Não deve conter espaços extras no início ou no fim',
    lowercase: 'Deve estar em minúsculas',
    uppercase: 'Deve estar em maiúsculas',
  },
  number: {
    min: ({ min }: { min: number }) => `Campo com valor mínimo de ${min}`,
    max: ({ max }: { max: number }) => `O valor máximo permitido é ${max}`,
    lessThan: ({ less }: { less: number }) => `O valor deve ser menor que ${less}`,
    moreThan: ({ more }: { more: number }) => `O valor deve ser maior que ${more}`,
    positive: ({ more }: { more: number }) => `O valor deve ser maior que ${more}`,
    negative: ({ less }: { less: number }) => `O valor deve ser menor que ${less}`,
    integer: 'O valor deve ser um número inteiro'
  },
  object: {
    noUnknown: 'Não pode conter chaves desconhecidas.',
  },
  array: {
    length: ({ length }: { length: number }) => `Deve conter exatamente ${length} ${length === 1 ? 'item' : 'itens'}`,
    min: ({ min }: { min: number }) => `Deve conter no mínimo ${min} ${min === 1 ? 'item' : 'itens'}`,
    max: ({ max }: { max: number }) => `Deve conter no máximo ${max} ${max === 1 ? 'item' : 'itens'}`,
  },
  boolean: {
    isValue: 'Deve ser um valor verdadeiro ou falso.'
  }
});

export default yup;

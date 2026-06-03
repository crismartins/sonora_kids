import { PhraseGroup } from "@/types";

export const PHRASES_MAIS_USADAS: PhraseGroup[] = [
  {
    category: "Mais Usadas",
    collection: [
      [
        { text: "Eu quero", color: "blue" },
        { text: "Bolo", color: "orange" },
        { text: "Chocolate", color: "brown" },
      ],
      [
        { text: "Eu quero", color: "blue" },
        { text: "Bolo", color: "orange" },
        { text: "Chocolate", color: "brown" },
      ],
      [
        { text: "Eu quero", color: "blue" },
        { text: "Bolo", color: "orange" },
      ],
      [
        { text: "Eu quero", color: "blue" },
        { text: "Água", color: "cyan" },
      ],
      [
        { text: "Eu", color: "greenAccent" },
        { text: "quero", color: "blue" },
        { text: "Brincar", color: "purple" },
      ],
    ],
  },
];

export const PHRASES_TODAS: PhraseGroup[] = [
  {
    category: "Todas",
    collection: [
      [
        { text: "Oi", color: "greenAccent" },
        { text: "Tchau", color: "orange" },
        { text: "Obrigado", color: "greenAccent" },
      ],
      [
        { text: "Eu quero", color: "blue" },
        { text: "Comer", color: "orange" },
        { text: "Banana", color: "yellow" },
      ],
      [
        { text: "Eu", color: "blue" },
        { text: "Quero", color: "greenAccent" },
        { text: "Água", color: "cyan" },
      ],
      [
        { text: "Eu quero", color: "blue" },
        { text: "Bolo", color: "orange" },
        { text: "Chocolate", color: "brown" },
      ],
      [
        { text: "Por favor", color: "purple" },
        { text: "Me ajuda", color: "teal" },
      ],
      [
        { text: "Bom dia", color: "yellow" },
      ],
      [
        { text: "Boa tarde", color: "orange" },
      ],
      [
        { text: "Boa noite", color: "indigo" },
      ],
      [
        { text: "Eu", color: "blue" },
        { text: "Quero", color: "blue" },
        { text: "ir ao banheiro", color: "teal" },
      ],
      [
        { text: "Estou", color: "orange" },
        { text: "com fome", color: "orange" },
      ],
    ],
  },
];

export const PHRASES: PhraseGroup[] = PHRASES_TODAS;

export const ROUTINE_BLOCKS = [
  {
    time: "8:00",
    label: "ROTINA MANHÃ",
    items: [
      { id: "r1", title: "Acordar", color: "yellow" },
      { id: "r2", title: "Escovar dentes", color: "blue" },
      { id: "r3", title: "Café", color: "orange" },
      { id: "r4", title: "Banho", color: "cyan" },
    ],
  },
  {
    time: "13:00",
    label: "ROTINA TARDE",
    items: [
      { id: "r5", title: "Almoço", color: "orange" },
      { id: "r6", title: "Oi", color: "greenAccent" },
      { id: "r7", title: "Tchau", color: "blue" },
      { id: "r8", title: "Brincar", color: "purple" },
    ],
  },
  {
    time: "20:00",
    label: "ROTINA NOITE",
    items: [
      { id: "r9", title: "Jantar", color: "orange" },
      { id: "r10", title: "Banho", color: "cyan" },
      { id: "r11", title: "Dormir", color: "indigo" },
    ],
  },
];

import { PhraseGroup } from "@/types";

export const PHRASES: PhraseGroup[] = [
  {
    category: "Todas",
    collection: [
      [
        { text: "Oi", color: "greenAccent" },
        { text: "Tchau", color: "orange" },
        { text: "Obrigado", color: "greenAccent" },
      ],
      [
        { text: "Quero", color: "greenAccent" },
        { text: "Comer", color: "orange" },
        { text: "Banana", color: "greenAccent" },
      ],
      [
        { text: "Eu", color: "blue" },
        { text: "Quero", color: "greenAccent" },
        { text: "Água", color: "cyan" },
      ],
      [
        { text: "Por favor", color: "purple" },
        { text: "Me ajuda", color: "teal" },
      ],
    ],
  },
  {
    category: "Saudações",
    collection: [
      [
        { text: "Bom", color: "yellow" },
        { text: "dia", color: "yellow" },
      ],
      [
        { text: "Boa", color: "orange" },
        { text: "tarde", color: "orange" },
      ],
      [
        { text: "Boa", color: "indigo" },
        { text: "noite", color: "indigo" },
      ],
      [
        { text: "Oi", color: "greenAccent" },
        { text: "tudo bem?", color: "greenAccent" },
      ],
    ],
  },
  {
    category: "Necessidades",
    collection: [
      [
        { text: "Quero", color: "blue" },
        { text: "ir ao", color: "blue" },
        { text: "banheiro", color: "teal" },
      ],
      [
        { text: "Estou", color: "orange" },
        { text: "com fome", color: "orange" },
      ],
      [
        { text: "Estou", color: "cyan" },
        { text: "com sede", color: "cyan" },
      ],
      [
        { text: "Quero", color: "purple" },
        { text: "descansar", color: "purple" },
      ],
    ],
  },
];

export const ROUTINE: PhraseGroup[] = [
  {
    category: "Manhã",
    collection: [
      [
        { text: "Acordar", color: "yellow" },
        { text: "Escovar dentes", color: "blue" },
        { text: "Café", color: "orange" },
      ],
      [
        { text: "Tomar banho", color: "cyan" },
        { text: "Vestir roupa", color: "purple" },
      ],
    ],
  },
  {
    category: "Tarde",
    collection: [
      [
        { text: "Almoço", color: "orange" },
        { text: "Brincar", color: "greenAccent" },
      ],
      [
        { text: "Estudar", color: "indigo" },
        { text: "Descansar", color: "teal" },
      ],
    ],
  },
  {
    category: "Noite",
    collection: [
      [
        { text: "Jantar", color: "orange" },
        { text: "Escovar dentes", color: "blue" },
        { text: "Dormir", color: "indigo" },
      ],
    ],
  },
];

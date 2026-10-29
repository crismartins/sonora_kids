import { ImageSourcePropType } from "react-native";

export type StoryPage = {
  text: string;
  /**
   * Ilustração desta página. Sem imagem, a tela reserva o espaço.
   * Exemplo: require("../assets/images/stories/chapeuzinho/01.png")
   */
  image?: ImageSourcePropType;
};

export type Story = {
  id: string;
  title: string;
  summary: string;
  colorName: string;
  /** Capa da lista. O mesmo formato de `pages[].image`. */
  cover?: ImageSourcePropType;
  pages: StoryPage[];
};

function page(text: string): StoryPage {
  return { text };
}

export const STORIES: Story[] = [
  {
    id: "chapeuzinho",
    title: "Chapeuzinho Vermelho",
    summary: "O caminho até a casa da vovó",
    colorName: "deepOrange",
    pages: [
      page("Era uma vez uma menina chamada Chapeuzinho Vermelho. Ela morava perto da floresta."),
      page("A mamãe preparou um bolo e disse: leve para a vovó, que está doente."),
      page("No caminho, Chapeuzinho encontrou o lobo. Ele perguntou aonde ela ia."),
      page("Chapeuzinho respondeu: vou para a casa da vovó."),
      page("O lobo correu por um atalho e chegou primeiro. Ele vestiu a roupa da vovó e deitou na cama."),
      page("Chapeuzinho chegou e estranhou: vovó, que olhos grandes você tem!"),
      page("O lobo respondeu: é para te ver melhor. E que boca grande! É para te comer!"),
      page("Um lenhador ouviu o susto e afugentou o lobo. Chapeuzinho e a vovó ficaram bem."),
    ],
  },
  {
    id: "tres-porquinhos",
    title: "Os Três Porquinhos",
    summary: "Três casas e um lobo soprador",
    colorName: "pink",
    pages: [
      page("Era uma vez três porquinhos. Eles saíram para construir suas próprias casas."),
      page("O primeiro porquinho fez uma casa de palha. Ficou pronta bem depressa."),
      page("O segundo porquinho fez uma casa de madeira."),
      page("O terceiro porquinho fez uma casa de tijolos. Demorou, mas ficou forte."),
      page("O lobo chegou na casa de palha e soprou. A casa voou, e o porquinho correu."),
      page("O lobo soprou a casa de madeira. Ela também caiu."),
      page("Os dois correram para a casa de tijolos. O lobo soprou, soprou, e a casa não se mexeu."),
      page("O lobo foi embora. Os três porquinhos estavam seguros e felizes."),
    ],
  },
];

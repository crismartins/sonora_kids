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

function page(text: string, image: ImageSourcePropType): StoryPage {
  return { text, image };
}

export const STORIES: Story[] = [
  {
    id: "chapeuzinho",
    title: "Chapeuzinho Vermelho",
    summary: "O caminho até a casa da vovó",
    colorName: "deepOrange",
    cover: require("../assets/images/stories/chapeuzinho/cover.jpg"),
    pages: [
      page(
        "Era uma vez uma menina chamada Chapeuzinho Vermelho. Ela morava perto da floresta.",
        require("../assets/images/stories/chapeuzinho/01.jpg"),
      ),
      page(
        "A mamãe preparou um bolo e disse: leve para a vovó, que está doente.",
        require("../assets/images/stories/chapeuzinho/02.jpg"),
      ),
      page(
        "No caminho, Chapeuzinho encontrou o lobo. Ele perguntou aonde ela ia.",
        require("../assets/images/stories/chapeuzinho/03.jpg"),
      ),
      page(
        "Chapeuzinho respondeu: vou para a casa da vovó.",
        require("../assets/images/stories/chapeuzinho/04.jpg"),
      ),
      page(
        "O lobo correu por um atalho e chegou primeiro. Ele vestiu a roupa da vovó e deitou na cama.",
        require("../assets/images/stories/chapeuzinho/05.jpg"),
      ),
      page(
        "Chapeuzinho chegou e estranhou: vovó, que olhos grandes você tem!",
        require("../assets/images/stories/chapeuzinho/06.jpg"),
      ),
      page(
        "O lobo respondeu: é para te ver melhor. E que boca grande! É para te comer!",
        require("../assets/images/stories/chapeuzinho/07.jpg"),
      ),
      page(
        "Um lenhador ouviu o susto e afugentou o lobo. Chapeuzinho e a vovó ficaram bem.",
        require("../assets/images/stories/chapeuzinho/08.jpg"),
      ),
    ],
  },
  {
    id: "tres-porquinhos",
    title: "Os Três Porquinhos",
    summary: "Três casas e um lobo soprador",
    colorName: "pink",
    cover: require("../assets/images/stories/tres-porquinhos/cover.jpg"),
    pages: [
      page(
        "Era uma vez três porquinhos. Eles saíram para construir suas próprias casas.",
        require("../assets/images/stories/tres-porquinhos/01.jpg"),
      ),
      page(
        "O primeiro porquinho fez uma casa de palha. Ficou pronta bem depressa.",
        require("../assets/images/stories/tres-porquinhos/02.jpg"),
      ),
      page(
        "O segundo porquinho fez uma casa de madeira.",
        require("../assets/images/stories/tres-porquinhos/03.jpg"),
      ),
      page(
        "O terceiro porquinho fez uma casa de tijolos. Demorou, mas ficou forte.",
        require("../assets/images/stories/tres-porquinhos/04.jpg"),
      ),
      page(
        "O lobo chegou na casa de palha e soprou. A casa voou, e o porquinho correu.",
        require("../assets/images/stories/tres-porquinhos/05.jpg"),
      ),
      page(
        "O lobo soprou a casa de madeira. Ela também caiu.",
        require("../assets/images/stories/tres-porquinhos/06.jpg"),
      ),
      page(
        "Os dois correram para a casa de tijolos. O lobo soprou, soprou, e a casa não se mexeu.",
        require("../assets/images/stories/tres-porquinhos/07.jpg"),
      ),
      page(
        "O lobo foi embora. Os três porquinhos estavam seguros e felizes.",
        require("../assets/images/stories/tres-porquinhos/08.jpg"),
      ),
    ],
  },
];

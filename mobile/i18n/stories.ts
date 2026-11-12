import { SpeechLanguage } from "@/services/appSettings";
import { Story } from "@/data/stories";

type StoryCopy = {
  title: string;
  summary: string;
  pages: string[];
};

const STORIES: Record<string, Partial<Record<SpeechLanguage, StoryCopy>>> = {
  chapeuzinho: {
    "pt-PT": {
      title: "Capuchinho Vermelho",
      summary: "O caminho até à casa da avó",
      pages: [
        "Era uma vez uma menina chamada Capuchinho Vermelho. Ela morava perto da floresta.",
        "A mãe preparou um bolo e disse: leva à avó, que está doente.",
        "No caminho, Capuchinho encontrou o lobo. Ele perguntou para onde ela ia.",
        "Capuchinho respondeu: vou para a casa da avó.",
        "O lobo correu por um atalho e chegou primeiro. Vestiu a roupa da avó e deitou-se na cama.",
        "Capuchinho chegou e estranhou: avó, que olhos tão grandes tem!",
        "O lobo respondeu: é para te ver melhor. E que boca tão grande! É para te comer!",
        "Um lenhador ouviu o susto e afugentou o lobo. Capuchinho e a avó ficaram bem.",
      ],
    },
    en: {
      title: "Little Red Riding Hood",
      summary: "The path to grandma's house",
      pages: [
        "Once there was a girl called Little Red Riding Hood. She lived near the forest.",
        "Mom packed a cake and said: take this to grandma, she is sick.",
        "On the path, Red met the wolf. He asked where she was going.",
        "Red answered: I'm going to grandma's house.",
        "The wolf ran a shortcut and got there first. He put on grandma's clothes and lay in the bed.",
        "Red arrived and said: grandma, what big eyes you have!",
        "The wolf answered: the better to see you. And what a big mouth! The better to eat you!",
        "A woodcutter heard the scare and chased the wolf away. Red and grandma were safe.",
      ],
    },
    es: {
      title: "Caperucita Roja",
      summary: "El camino a la casa de la abuela",
      pages: [
        "Había una vez una niña llamada Caperucita Roja. Vivía cerca del bosque.",
        "Mamá preparó un pastel y dijo: llévaselo a la abuela, que está enferma.",
        "En el camino, Caperucita encontró al lobo. Él preguntó a dónde iba.",
        "Caperucita respondió: voy a la casa de la abuela.",
        "El lobo corrió por un atajo y llegó primero. Se puso la ropa de la abuela y se acostó.",
        "Caperucita llegó y dijo: abuela, ¡qué ojos tan grandes tienes!",
        "El lobo respondió: son para verte mejor. ¡Y qué boca tan grande! ¡Es para comerte!",
        "Un leñador oyó el susto y ahuyentó al lobo. Caperucita y la abuela quedaron bien.",
      ],
    },
  },
  "tres-porquinhos": {
    "pt-PT": {
      title: "Os Três Porquinhos",
      summary: "Três casas e um lobo que sopra",
      pages: [
        "Era uma vez três porquinhos. Saíram para construir as suas próprias casas.",
        "O primeiro porquinho fez uma casa de palha. Ficou pronta depressa.",
        "O segundo porquinho fez uma casa de madeira.",
        "O terceiro porquinho fez uma casa de tijolos. Demorou, mas ficou forte.",
        "O lobo chegou à casa de palha e soprou. A casa voou, e o porquinho correu.",
        "O lobo soprou a casa de madeira. Ela também caiu.",
        "Os dois correram para a casa de tijolos. O lobo soprou, soprou, e a casa não se mexeu.",
        "O lobo foi-se embora. Os três porquinhos estavam seguros e felizes.",
      ],
    },
    en: {
      title: "The Three Little Pigs",
      summary: "Three houses and a wolf who blows",
      pages: [
        "Once there were three little pigs. They left to build their own houses.",
        "The first pig made a house of straw. It was ready very fast.",
        "The second pig made a house of wood.",
        "The third pig made a house of bricks. It took time, but it was strong.",
        "The wolf came to the straw house and blew. The house flew away, and the pig ran.",
        "The wolf blew the wood house. It fell too.",
        "The two ran to the brick house. The wolf blew and blew, and the house did not move.",
        "The wolf went away. The three pigs were safe and happy.",
      ],
    },
    es: {
      title: "Los tres cerditos",
      summary: "Tres casas y un lobo que sopla",
      pages: [
        "Había una vez tres cerditos. Salieron a construir sus propias casas.",
        "El primer cerdito hizo una casa de paja. Quedó lista muy rápido.",
        "El segundo cerdito hizo una casa de madera.",
        "El tercer cerdito hizo una casa de ladrillos. Tardó, pero quedó fuerte.",
        "El lobo llegó a la casa de paja y sopló. La casa voló, y el cerdito corrió.",
        "El lobo sopló la casa de madera. También se cayó.",
        "Los dos corrieron a la casa de ladrillos. El lobo sopló y sopló, y la casa no se movió.",
        "El lobo se fue. Los tres cerditos estaban seguros y felices.",
      ],
    },
  },
};

export function localizedStory(story: Story, language: SpeechLanguage): Story {
  const copy = STORIES[story.id]?.[language];
  if (!copy) return story;
  return {
    ...story,
    title: copy.title,
    summary: copy.summary,
    pages: story.pages.map((page, index) => ({
      ...page,
      text: copy.pages[index] ?? page.text,
    })),
  };
}

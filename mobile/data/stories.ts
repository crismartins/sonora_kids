import { SolarIconName } from "@/components/SolarIcon";

export type StoryIcon = SolarIconName;

export type StoryPage = {
  text: string;
  icon: StoryIcon;
  colorName: string;
};

export type Story = {
  id: string;
  title: string;
  summary: string;
  colorName: string;
  icon: StoryIcon;
  pages: StoryPage[];
};

export const STORIES: Story[] = [
  {
    id: "bom-dia",
    title: "Bom dia",
    summary: "Acordar, comer e ir para a escola",
    colorName: "amber",
    icon: "sun",
    pages: [
      { text: "Bom dia!", icon: "sun", colorName: "amber" },
      { text: "Eu quero café da manhã.", icon: "chef-hat", colorName: "deepOrange" },
      { text: "Agora, escovar os dentes.", icon: "smile", colorName: "cyan" },
      { text: "Eu vou pra escola.", icon: "square-academic-cap", colorName: "blue" },
      { text: "Tchau!", icon: "fallback", colorName: "greenAccent" },
    ],
  },
  {
    id: "brincar",
    title: "Hora de brincar",
    summary: "Pedir o brinquedo e se divertir",
    colorName: "purple",
    icon: "gamepad",
    pages: [
      { text: "Eu quero brincar.", icon: "gamepad", colorName: "purple" },
      { text: "Eu quero o brinquedo.", icon: "box", colorName: "blue" },
      { text: "Eu estou feliz.", icon: "smile", colorName: "orange" },
      { text: "Acabou.", icon: "check-circle", colorName: "teal" },
      { text: "Obrigado.", icon: "heart", colorName: "greenAccent" },
    ],
  },
  {
    id: "pausa",
    title: "Quero uma pausa",
    summary: "Quando o barulho fica demais",
    colorName: "teal",
    icon: "leaf",
    pages: [
      { text: "Muito barulho.", icon: "volume-loud", colorName: "pink" },
      { text: "Eu quero silêncio.", icon: "volume-cross", colorName: "pink" },
      { text: "Eu quero o cantinho calmo.", icon: "leaf", colorName: "lightGreen" },
      { text: "Eu estou calmo.", icon: "smile", colorName: "teal" },
      { text: "Tudo bem.", icon: "heart", colorName: "greenAccent" },
    ],
  },
  {
    id: "dormir",
    title: "Hora de dormir",
    summary: "Banho, dentes e boa noite",
    colorName: "indigo",
    icon: "moon",
    pages: [
      { text: "Eu estou cansado.", icon: "moon", colorName: "indigo" },
      { text: "Agora, tomar banho.", icon: "waterdrop", colorName: "cyan" },
      { text: "Escovar os dentes.", icon: "smile", colorName: "blue" },
      { text: "Hora de dormir.", icon: "bed", colorName: "deepPurple" },
      { text: "Boa noite.", icon: "moon", colorName: "indigo" },
    ],
  },
];

import { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

export type StoryIcon = ComponentProps<typeof Ionicons>["name"];

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
    icon: "sunny-outline",
    pages: [
      { text: "Bom dia!", icon: "sunny-outline", colorName: "amber" },
      { text: "Eu quero café da manhã.", icon: "restaurant-outline", colorName: "deepOrange" },
      { text: "Agora, escovar os dentes.", icon: "happy-outline", colorName: "cyan" },
      { text: "Eu vou pra escola.", icon: "school-outline", colorName: "blue" },
      { text: "Tchau!", icon: "hand-left-outline", colorName: "greenAccent" },
    ],
  },
  {
    id: "brincar",
    title: "Hora de brincar",
    summary: "Pedir o brinquedo e se divertir",
    colorName: "purple",
    icon: "game-controller-outline",
    pages: [
      { text: "Eu quero brincar.", icon: "game-controller-outline", colorName: "purple" },
      { text: "Eu quero o brinquedo.", icon: "cube-outline", colorName: "blue" },
      { text: "Eu estou feliz.", icon: "happy-outline", colorName: "orange" },
      { text: "Acabou.", icon: "checkmark-circle-outline", colorName: "teal" },
      { text: "Obrigado.", icon: "heart-outline", colorName: "greenAccent" },
    ],
  },
  {
    id: "pausa",
    title: "Quero uma pausa",
    summary: "Quando o barulho fica demais",
    colorName: "teal",
    icon: "leaf-outline",
    pages: [
      { text: "Muito barulho.", icon: "volume-high-outline", colorName: "pink" },
      { text: "Eu quero silêncio.", icon: "volume-mute-outline", colorName: "pink" },
      { text: "Eu quero o cantinho calmo.", icon: "leaf-outline", colorName: "lightGreen" },
      { text: "Eu estou calmo.", icon: "happy-outline", colorName: "teal" },
      { text: "Tudo bem.", icon: "heart-outline", colorName: "greenAccent" },
    ],
  },
  {
    id: "dormir",
    title: "Hora de dormir",
    summary: "Banho, dentes e boa noite",
    colorName: "indigo",
    icon: "moon-outline",
    pages: [
      { text: "Eu estou cansado.", icon: "moon-outline", colorName: "indigo" },
      { text: "Agora, tomar banho.", icon: "water-outline", colorName: "cyan" },
      { text: "Escovar os dentes.", icon: "happy-outline", colorName: "blue" },
      { text: "Hora de dormir.", icon: "bed-outline", colorName: "deepPurple" },
      { text: "Boa noite.", icon: "moon-outline", colorName: "indigo" },
    ],
  },
];

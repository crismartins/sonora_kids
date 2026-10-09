import { Category } from "@/types";

const AVATAR = require("../assets/images/avatar_default_v1.png");
const AVATAR_2 = require("../assets/images/avatar_default_v2.png");

/**
 * Static PECS catalog (snapshot of WordPress GraphQL data, offline-friendly).
 */
export const MOCK_CATEGORIES: Category[] = [
  {
    name: "Boas Maneiras",
    slug: "boas-maneiras",
    categoriasDePec: {
      configuracoesCategorias: { cor: "greenAccent" },
    },
    pECS: {
      nodes: [
        { id: "cG9zdDo1", title: "Oi", localImage: AVATAR },
        { id: "cG9zdDo5", title: "Tchau", localImage: AVATAR_2 },
        { id: "cG9zdDozMg==", title: "Bom Dia", localImage: AVATAR },
        { id: "cG9zdDozMQ==", title: "Obrigado", localImage: AVATAR },
        { id: "cG9zdDozMw==", title: "Boa Tarde", localImage: AVATAR_2 },
        { id: "cG9zdDozNA==", title: "Boa Noite", localImage: AVATAR_2 },
      ],
    },
  },
  {
    name: "Sentimentos",
    slug: "sentimentos",
    categoriasDePec: {
      configuracoesCategorias: { cor: "orange" },
    },
    pECS: { nodes: [] },
  },
  {
    name: "Comida e Bebida",
    slug: "comida-e-bebida",
    categoriasDePec: {
      configuracoesCategorias: { cor: "deepOrange" },
    },
    pECS: {
      nodes: [
        { id: "cG9zdDozNQ==", title: "Maçã", localImage: AVATAR },
        { id: "cG9zdDoxOQ==", title: "Pão de Queijo", localImage: AVATAR_2 },
      ],
    },
  },
  {
    name: "Necessidades",
    slug: "necessidades",
    categoriasDePec: {
      configuracoesCategorias: { cor: "pink" },
    },
    pECS: { nodes: [] },
  },
  {
    name: "Objetos e Brinquedos",
    slug: "objetos-e-brinquedos",
    categoriasDePec: {
      configuracoesCategorias: { cor: "blue" },
    },
    pECS: { nodes: [] },
  },
  {
    name: "Pessoas",
    slug: "pessoas",
    categoriasDePec: {
      configuracoesCategorias: { cor: "teal" },
    },
    pECS: { nodes: [] },
  },
  {
    name: "Dia a Dia",
    slug: "dia-a-dia",
    categoriasDePec: {
      configuracoesCategorias: { cor: "deepPurple" },
    },
    pECS: { nodes: [] },
  },
  {
    name: "Animais",
    slug: "animais",
    categoriasDePec: {
      configuracoesCategorias: { cor: "brown" },
    },
    pECS: { nodes: [] },
  },
  {
    name: "Perguntas e Respostas",
    slug: "perguntas-e-respostas",
    categoriasDePec: {
      configuracoesCategorias: { cor: "cyan" },
    },
    pECS: { nodes: [] },
  },
  {
    name: "Datas e Eventos",
    slug: "datas-e-eventos",
    categoriasDePec: {
      configuracoesCategorias: { cor: "blueGrey" },
    },
    pECS: { nodes: [] },
  },
  {
    name: "Formas e Cores",
    slug: "formas-e-cores",
    categoriasDePec: {
      configuracoesCategorias: { cor: "grey" },
    },
    pECS: { nodes: [] },
  },
  {
    name: "Lugares",
    slug: "lugares",
    categoriasDePec: {
      configuracoesCategorias: { cor: "lightGreen" },
    },
    pECS: { nodes: [] },
  },
  {
    name: "Ações e Atividades",
    slug: "acoes-e-atividades",
    categoriasDePec: {
      configuracoesCategorias: { cor: "purple" },
    },
    pECS: { nodes: [] },
  },
  {
    name: "Roupas e Acessórios",
    slug: "roupas-e-acessorios",
    categoriasDePec: {
      configuracoesCategorias: { cor: "indigo" },
    },
    pECS: { nodes: [] },
  },
  {
    name: "Transporte",
    slug: "transporte",
    categoriasDePec: {
      configuracoesCategorias: { cor: "yellow" },
    },
    pECS: { nodes: [] },
  },
];

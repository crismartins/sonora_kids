import { ChildSex } from "@/services/profile";

/** Feelings about the child. The catalog keeps the masculine form as the stored title. */
const FEMININE: Record<string, string> = {
  animado: "Animada",
  ansioso: "Ansiosa",
  bravo: "Brava",
  calmo: "Calma",
  cansado: "Cansada",
  confuso: "Confusa",
  entediado: "Entediada",
  envergonhado: "Envergonhada",
  frustrado: "Frustrada",
  nervoso: "Nervosa",
  orgulhoso: "Orgulhosa",
};

const MASCULINE = Object.fromEntries(
  Object.entries(FEMININE).map(([base, feminine]) => [feminine.toLocaleLowerCase("pt-BR"), base]),
);

function titleKey(title: string) {
  return title.trim().toLocaleLowerCase("pt-BR");
}

function catalogCase(base: string) {
  return base.charAt(0).toLocaleUpperCase("pt-BR") + base.slice(1);
}

/** Catalog title, so image lookup still works if a phrase was saved in the feminine form. */
export function pecBaseTitle(title: string) {
  const base = MASCULINE[titleKey(title)];
  return base ? catalogCase(base) : title;
}

/** Word shown and spoken. Menina uses the feminine feeling; everything else stays as stored. */
export function pecLabel(title: string, sex: ChildSex) {
  if (sex !== "menina") return pecBaseTitle(title);
  const feminine = FEMININE[titleKey(pecBaseTitle(title))];
  return feminine ?? title;
}

export function pecPhrase(titles: string[], sex: ChildSex) {
  return titles.map((title) => pecLabel(title, sex)).join(" ");
}

import { lookupCatalog } from "@/i18n";
import { getActiveLocale } from "@/i18n/locale";
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

/** Word shown and spoken. Menina uses the feminine feeling; other languages use the catalog. */
export function pecLabel(title: string, sex: ChildSex) {
  const base = pecBaseTitle(title);
  const language = getActiveLocale();
  const feminine = sex === "menina";
  const gendered = feminine ? (FEMININE[titleKey(base)] ?? base) : base;
  if (language === "pt-BR") return gendered;
  const translated = lookupCatalog(base, language, feminine);
  if (translated) return translated;
  return language === "pt-PT" ? gendered : title;
}

export function pecPhrase(titles: string[], sex: ChildSex) {
  return titles.map((item) => pecLabel(item, sex)).join(" ");
}

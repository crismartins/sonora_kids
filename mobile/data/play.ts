import { ImageSourcePropType } from "react-native";
import { MOCK_CATEGORIES } from "@/data/categories";
import { imageFromPec } from "@/data/pecImages";

export type PlayPec = {
  id: string;
  title: string;
  colorName: string;
  image: ImageSourcePropType;
};

const SKIP_SLUGS = new Set(["palavras"]);

export function shuffle<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i];
    next[i] = next[j] as T;
    next[j] = current as T;
  }
  return next;
}

export function sample<T>(items: readonly T[], count: number): T[] {
  return shuffle(items).slice(0, Math.min(count, items.length));
}

/** Concrete, speakable PECS. Skips short function words like "de" and "em". */
export function playPecs(): PlayPec[] {
  const seen = new Set<string>();
  const items: PlayPec[] = [];

  for (const category of MOCK_CATEGORIES) {
    if (SKIP_SLUGS.has(category.slug)) continue;
    const colorName = category.categoriasDePec.configuracoesCategorias.cor;
    for (const node of category.pECS.nodes) {
      const title = node.title.trim();
      const words = title.split(/\s+/);
      if (title.length < 3 || title.length > 16 || words.length > 2) continue;
      const key = title.toLocaleLowerCase("pt-BR");
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ id: node.id, title, colorName, image: imageFromPec(node) });
    }
  }

  return items;
}

import { ImageSourcePropType } from "react-native";
import { MOCK_CATEGORIES } from "@/data/categories";
import { imageFromPec } from "@/data/pecImages";
import { customPecToItem, getCustomPecs } from "@/services/customPecs";
import { ChildSex } from "@/services/profile";

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

export function speakableTitle(title: string) {
  const text = title.trim();
  const words = text.split(/\s+/);
  return text.length >= 3 && text.length <= 16 && words.length <= 2;
}

function colorForSlug(slug: string) {
  return (
    MOCK_CATEGORIES.find((category) => category.slug === slug)?.categoriasDePec.configuracoesCategorias.cor ??
    "blue"
  );
}

function pushPlayPec(
  items: PlayPec[],
  seen: Set<string>,
  pec: { id: string; title: string; colorName: string; image: ImageSourcePropType },
) {
  const title = pec.title.trim();
  if (!speakableTitle(title)) return;
  const key = title.toLocaleLowerCase("pt-BR");
  if (seen.has(key)) return;
  seen.add(key);
  items.push({ id: pec.id, title, colorName: pec.colorName, image: pec.image });
}

/** Concrete, speakable PECS, including cards created on this device. Skips short function words. */
export function playPecs(sex: ChildSex = "menina"): PlayPec[] {
  const seen = new Set<string>();
  const items: PlayPec[] = [];

  for (const category of MOCK_CATEGORIES) {
    if (SKIP_SLUGS.has(category.slug)) continue;
    const colorName = category.categoriasDePec.configuracoesCategorias.cor;
    for (const node of category.pECS.nodes) {
      pushPlayPec(items, seen, {
        id: node.id,
        title: node.title,
        colorName,
        image: imageFromPec(node, sex),
      });
    }
  }

  for (const pec of getCustomPecs()) {
    if (SKIP_SLUGS.has(pec.categorySlug)) continue;
    const item = customPecToItem(pec);
    pushPlayPec(items, seen, {
      id: pec.id,
      title: pec.title,
      colorName: colorForSlug(pec.categorySlug),
      image: imageFromPec(item, sex),
    });
  }

  return items;
}

const MY_WORDS_LIMIT = 8;

/** Newest speakable cards created on this device, for the words story. */
export function customPlayPecs(sex: ChildSex = "menina"): PlayPec[] {
  const seen = new Set<string>();
  const items: PlayPec[] = [];
  const newest = [...getCustomPecs()].reverse();
  for (const pec of newest) {
    if (SKIP_SLUGS.has(pec.categorySlug)) continue;
    const item = customPecToItem(pec);
    pushPlayPec(items, seen, {
      id: pec.id,
      title: pec.title,
      colorName: colorForSlug(pec.categorySlug),
      image: imageFromPec(item, sex),
    });
    if (items.length >= MY_WORDS_LIMIT) break;
  }
  return items;
}

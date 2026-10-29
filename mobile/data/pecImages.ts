import { ImageSourcePropType } from "react-native";
import { MOCK_CATEGORIES } from "@/data/categories";
import { PecItem } from "@/types";

export const PEC_FALLBACK_IMAGE = require("../assets/images/avatar_default_v1.png");

export function imageFromPec(pec: PecItem): ImageSourcePropType {
  if (pec.localImage) return pec.localImage;
  const uri = pec.featuredImage?.node?.sourceUrl;
  if (uri) return { uri };
  return PEC_FALLBACK_IMAGE;
}

function titleKey(title: string) {
  return title.trim().toLocaleLowerCase("pt-BR");
}

const imageByTitle = new Map<string, ImageSourcePropType>();

for (const category of MOCK_CATEGORIES) {
  for (const pec of category.pECS.nodes) {
    const key = titleKey(pec.title);
    if (!imageByTitle.has(key)) imageByTitle.set(key, imageFromPec(pec));
  }
}

/** Same picture the PEC catalog uses for this label. */
export function pecImageForTitle(title: string): ImageSourcePropType {
  return imageByTitle.get(titleKey(title)) ?? PEC_FALLBACK_IMAGE;
}

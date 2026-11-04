import { ImageSourcePropType } from "react-native";
import { MOCK_CATEGORIES } from "@/data/categories";
import { boyImageForTitle } from "@/data/pecBoyImages";
import { pecBaseTitle } from "@/data/pecLabels";
import { pecImageOverride } from "@/services/pecImageOverrides";
import { ChildSex } from "@/services/profile";
import { PecItem } from "@/types";

export const PEC_FALLBACK_IMAGE = require("../assets/images/avatar_default_v1.png");

function bundledImage(pec: PecItem, sex: ChildSex): ImageSourcePropType {
  const uri = pec.featuredImage?.node?.sourceUrl;
  if (uri && !pec.localImage) return { uri };
  if (sex === "menino") {
    const boy = boyImageForTitle(pecBaseTitle(pec.title));
    if (boy) return boy;
  }
  if (pec.localImage) return pec.localImage;
  if (uri) return { uri };
  return PEC_FALLBACK_IMAGE;
}

export function imageFromPec(pec: PecItem, sex: ChildSex = "menina"): ImageSourcePropType {
  const custom = pecImageOverride(pec.id, pec.title);
  if (custom) return { uri: custom };
  return bundledImage(pec, sex);
}

function titleKey(title: string) {
  return title.trim().toLocaleLowerCase("pt-BR");
}

const imageByTitle = new Map<string, ImageSourcePropType>();

for (const category of MOCK_CATEGORIES) {
  for (const pec of category.pECS.nodes) {
    const key = titleKey(pec.title);
    if (!imageByTitle.has(key)) imageByTitle.set(key, bundledImage(pec, "menina"));
  }
}

/** Same picture the PEC catalog uses for this label. */
export function pecImageForTitle(title: string, sex: ChildSex = "menina"): ImageSourcePropType {
  const base = pecBaseTitle(title);
  const custom = pecImageOverride(undefined, base);
  if (custom) return { uri: custom };
  if (sex === "menino") {
    const boy = boyImageForTitle(base);
    if (boy) return boy;
  }
  return imageByTitle.get(titleKey(base)) ?? PEC_FALLBACK_IMAGE;
}

import { Image } from "react-native";
import { categoryIconBySlug } from "@/constants/categoryIcons";

export function CategoryIcon({ slug, size }: { slug: string; size: number }) {
  const source = categoryIconBySlug[slug];
  if (!source) return null;
  return (
    <Image
      source={source}
      resizeMode="contain"
      style={{ width: size, height: size }}
    />
  );
}

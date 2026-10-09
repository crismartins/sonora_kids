import { ImageSourcePropType } from "react-native";

export interface PecItem {
  id: string;
  title: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
    };
  } | null;
  localImage?: ImageSourcePropType;
}

export interface CategoryConfig {
  cor: string;
  icone?: {
    node: {
      mediaItemUrl: string;
    };
  };
}

export interface Category {
  name: string;
  slug: string;
  categoriasDePec: {
    configuracoesCategorias: CategoryConfig;
  };
  pECS: {
    nodes: PecItem[];
  };
}

export interface PhraseItem {
  text: string;
  color: string;
  image?: string;
}

export interface PhraseGroup {
  category: string;
  collection: PhraseItem[][];
}

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { View, FlatList, ScrollView, ImageSourcePropType } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { FloatingButton } from "@/components/Button";
import { useAppSettings } from "@/context/AppSettingsContext";
import { PhraseCard } from "@/components/PhraseCard";
import { FilterChip } from "@/components/FilterChip";
import { EmptyState } from "@/components/ScreenState";
import { openPhraseForm } from "@/components/AddPhraseModal";
import { PhraseActionsModal } from "@/components/PhraseActionsModal";
import { tabBarClearance } from "@/constants/tabBar";
import { PHRASES_MAIS_USADAS, PHRASES_TODAS } from "@/constants/phrases";
import { useCategories } from "@/hooks/useCategories";
import { useCustomPecs } from "@/hooks/useCustomPecs";
import { useCustomPhrases } from "@/hooks/useCustomPhrases";
import { customPecToItem } from "@/services/customPecs";
import { CustomPhrase } from "@/services/customPhrases";
import { PecItem, PhraseItem } from "@/types";

const FILTER_TABS = ["MAIS USADAS", "TODAS", "MINHAS FRASES"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

type ListedPhrase = {
  key: string;
  items: PhraseItem[];
  customId?: string;
};

function catalogRows(collection: PhraseItem[][], prefix: string): ListedPhrase[] {
  return collection.map((items, index) => ({
    key: `${prefix}-${index}`,
    items,
  }));
}

function pecImageSource(pec: PecItem): ImageSourcePropType | undefined {
  if (pec.localImage) return pec.localImage;
  const uri = pec.featuredImage?.node?.sourceUrl;
  if (!uri) return undefined;
  return { uri };
}

export default function FrasesScreen() {
  const insets = useSafeAreaInsets();
  const { haptic } = useAppSettings();
  const { data: categories } = useCategories();
  const { pecs: customPecs } = useCustomPecs();
  const { phrases: customPhrases, addPhrase, updatePhrase, deletePhrase } = useCustomPhrases();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("MAIS USADAS");
  const [menuPhrase, setMenuPhrase] = useState<CustomPhrase | null>(null);
  const [editingPhrase, setEditingPhrase] = useState<CustomPhrase | null>(null);
  const phraseFormOpen = useRef(false);

  const catalog = useMemo(() => {
    if (!categories) return undefined;
    if (customPecs.length === 0) return categories;
    return categories.map((category) => ({
      ...category,
      pECS: {
        nodes: [
          ...category.pECS.nodes,
          ...customPecs.filter((pec) => pec.categorySlug === category.slug).map(customPecToItem),
        ],
      },
    }));
  }, [categories, customPecs]);

  const handleSelectFilter = useCallback(
    (tab: FilterTab) => {
      setActiveFilter(tab);
      haptic(Haptics.ImpactFeedbackStyle.Light);
    },
    [haptic],
  );

  const pecImages = useMemo(() => {
    const map = new Map<string, ImageSourcePropType>();
    for (const category of catalog ?? []) {
      for (const pec of category.pECS.nodes) {
        const source = pecImageSource(pec);
        if (!source) continue;
        map.set(pec.title.trim().toLocaleLowerCase("pt-BR"), source);
      }
    }
    return map;
  }, [catalog]);

  const phrases = useMemo(() => {
    const mine: ListedPhrase[] = customPhrases.map((phrase) => ({
      key: phrase.id,
      items: phrase.items,
      customId: phrase.id,
    }));
    switch (activeFilter) {
      case "MAIS USADAS":
        return catalogRows(PHRASES_MAIS_USADAS[0].collection, "mais");
      case "MINHAS FRASES":
        return mine;
      case "TODAS":
      default:
        return catalogRows(PHRASES_TODAS[0].collection, "todas");
    }
  }, [activeFilter, customPhrases]);

  const tabBarHeight = tabBarClearance(insets.bottom);

  useEffect(() => {
    if (!editingPhrase || !catalog || phraseFormOpen.current) return;
    phraseFormOpen.current = true;
    const phrase = editingPhrase;
    let opened = false;
    const timer = setTimeout(() => {
      opened = true;
      openPhraseForm({
        categories: catalog,
        initialPhrase: phrase,
        onSubmit: async (items) => {
          await updatePhrase(phrase.id, items);
        },
        onClose: () => {
          phraseFormOpen.current = false;
          setEditingPhrase(null);
        },
      });
    }, 280);
    return () => {
      clearTimeout(timer);
      if (!opened) phraseFormOpen.current = false;
    };
  }, [editingPhrase, catalog, updatePhrase]);

  const openManage = useCallback(
    (customId: string) => {
      const phrase = customPhrases.find((entry) => entry.id === customId);
      if (phrase) setMenuPhrase(phrase);
    },
    [customPhrases],
  );

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          {FILTER_TABS.map((tab) => (
            <FilterChip key={tab} label={tab} selected={tab === activeFilter} onPress={() => handleSelectFilter(tab)} />
          ))}
        </ScrollView>
      </View>

      {phrases.length === 0 ? (
        <EmptyState
          icon="chat-square-line"
          title="Nenhuma frase aqui"
          detail="Toque em + e monte uma frase com os PECs"
        />
      ) : (
        <FlatList
          data={phrases}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: tabBarHeight + 88 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const customId = item.customId;
            return (
              <PhraseCard
                phrase={item.items}
                images={pecImages}
                onManage={customId ? () => openManage(customId) : undefined}
              />
            );
          }}
        />
      )}

      <FloatingButton
        icon="chat-square-add"
        accessibilityLabel="Adicionar frase"
        onPress={() => {
          if (!catalog) return;
          openPhraseForm({
            categories: catalog,
            onSubmit: async (items) => {
              await addPhrase(items);
              setActiveFilter("MINHAS FRASES");
            },
          });
        }}
        bottom={tabBarHeight + 12}
      />

      <PhraseActionsModal
        phrase={menuPhrase}
        onClose={() => setMenuPhrase(null)}
        onEdit={(phrase) => {
          setMenuPhrase(null);
          setEditingPhrase(phrase);
        }}
        onDelete={async (phrase) => {
          await deletePhrase(phrase.id);
          setMenuPhrase(null);
        }}
      />
    </View>
  );
}

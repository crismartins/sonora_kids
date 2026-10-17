import React, { useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { SolarIcon } from "@/components/SolarIcon";
import { useAppSettings } from "@/context/AppSettingsContext";
import { PhraseCard } from "@/components/PhraseCard";
import { PillText } from "@/components/PillText";
import { AddPhraseModal } from "@/components/AddPhraseModal";
import { PhraseActionsModal } from "@/components/PhraseActionsModal";
import { colors } from "@/constants/colors";
import { tabBarClearance } from "@/constants/tabBar";
import { PHRASES_MAIS_USADAS, PHRASES_TODAS } from "@/constants/phrases";
import { useCategories } from "@/hooks/useCategories";
import { useCustomPecs } from "@/hooks/useCustomPecs";
import { useCustomPhrases } from "@/hooks/useCustomPhrases";
import { customPecToItem } from "@/services/customPecs";
import { CustomPhrase } from "@/services/customPhrases";
import { PhraseItem } from "@/types";

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

export default function FrasesScreen() {
  const insets = useSafeAreaInsets();
  const { haptic } = useAppSettings();
  const { data: categories } = useCategories();
  const { pecs: customPecs } = useCustomPecs();
  const { phrases: customPhrases, addPhrase, updatePhrase, deletePhrase } = useCustomPhrases();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("MAIS USADAS");
  const [addOpen, setAddOpen] = useState(false);
  const [menuPhrase, setMenuPhrase] = useState<CustomPhrase | null>(null);
  const [editingPhrase, setEditingPhrase] = useState<CustomPhrase | null>(null);

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

  const openManage = useCallback(
    (customId: string) => {
      const phrase = customPhrases.find((entry) => entry.id === customId);
      if (phrase) setMenuPhrase(phrase);
    },
    [customPhrases],
  );

  return (
    <View className="flex-1 bg-white">
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
        {FILTER_TABS.map((tab) => {
          const isActive = tab === activeFilter;
          return (
            <Pressable
              key={tab}
              onPress={() => handleSelectFilter(tab)}
              className={`h-10 items-center justify-center rounded-full px-4 ${
                isActive ? "bg-[#E3F2FD]" : "border-transparent bg-[#F5F5F5]"
              }`}
            >
              <PillText
                size={15}
                numberOfLines={1}
                style={{
                  color: isActive ? colors.primary : colors.neutralDark,
                  letterSpacing: 0.3,
                }}
              >
                {tab}
              </PillText>
            </Pressable>
          );
        })}
      </ScrollView>

      {phrases.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2 px-10">
          <Text className="text-5xl">💬</Text>
          <Text className="font-quicksand text-2xl text-dark">Nenhuma frase aqui</Text>
          <Text className="text-center font-quicksand text-lg text-neutral-dark">
            Toque em + e monte uma frase com os PECs
          </Text>
        </View>
      ) : (
        <FlatList
          data={phrases}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: tabBarHeight + 88 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const customId = item.customId;
            return <PhraseCard phrase={item.items} onManage={customId ? () => openManage(customId) : undefined} />;
          }}
        />
      )}

      <Pressable
        accessibilityLabel="Adicionar frase"
        onPress={() => setAddOpen(true)}
        className="absolute right-5 h-14 w-14 items-center justify-center rounded-full bg-primary"
        style={{
          bottom: tabBarHeight + 12,
          shadowColor: "#001D4A",
          shadowOpacity: 0.22,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <SolarIcon name="add" size={32} color="#fff" />
      </Pressable>

      {catalog ? (
        <AddPhraseModal
          visible={addOpen || !!editingPhrase}
          categories={catalog}
          initialPhrase={editingPhrase}
          onClose={() => {
            setAddOpen(false);
            setEditingPhrase(null);
          }}
          onSubmit={async (items) => {
            if (editingPhrase) {
              await updatePhrase(editingPhrase.id, items);
            } else {
              await addPhrase(items);
              setActiveFilter("MINHAS FRASES");
            }
            setAddOpen(false);
            setEditingPhrase(null);
          }}
        />
      ) : null}

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

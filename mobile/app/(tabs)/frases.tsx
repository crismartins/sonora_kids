import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { PhraseCard } from "@/components/PhraseCard";
import { PHRASES_MAIS_USADAS, PHRASES_TODAS } from "@/constants/phrases";
import { PhraseItem } from "@/types";

const FILTER_TABS = ["MAIS USADAS", "TODAS", "MINHAS FRASES"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

function getPhrasesForFilter(filter: FilterTab): PhraseItem[][] {
  switch (filter) {
    case "MAIS USADAS":
      return PHRASES_MAIS_USADAS[0].collection;
    case "TODAS":
      return PHRASES_TODAS[0].collection;
    case "MINHAS FRASES":
      return [];
    default:
      return PHRASES_TODAS[0].collection;
  }
}

export default function FrasesScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("MAIS USADAS");

  const handleSelectFilter = useCallback((tab: FilterTab) => {
    setActiveFilter(tab);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const phrases = getPhrasesForFilter(activeFilter);
  const tabBarHeight = Platform.OS === "web" ? 84 : 60 + insets.bottom;

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row gap-2 border-b border-[#F0F0F0] bg-white px-4 py-2.5">
        {FILTER_TABS.map((tab) => {
          const isActive = tab === activeFilter;
          return (
            <Pressable
              key={tab}
              onPress={() => handleSelectFilter(tab)}
              className={`flex-1 items-center justify-center rounded-full py-2 ${
                isActive ? "border-[1.5px] border-primary bg-[#E3F2FD]" : "bg-[#F5F5F5]"
              }`}
            >
              <Text
                className={`font-dongle-bold text-[13px] tracking-wide ${
                  isActive ? "text-primary" : "text-neutral-dark"
                }`}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {phrases.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2 px-10">
          <Text className="text-5xl">💬</Text>
          <Text className="font-dongle-bold text-2xl text-dark">Nenhuma frase aqui</Text>
          <Text className="text-center font-dongle text-lg leading-[22px] text-neutral-dark">
            Suas frases personalizadas aparecerão aqui
          </Text>
        </View>
      ) : (
        <FlatList
          data={phrases}
          keyExtractor={(_, idx) => `phrase-${idx}`}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: tabBarHeight + 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <PhraseCard phrase={item} />}
        />
      )}
    </View>
  );
}

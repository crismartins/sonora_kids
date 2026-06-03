import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { PhraseCard } from "@/components/PhraseCard";
import { colors } from "@/constants/colors";
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
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {FILTER_TABS.map((tab) => {
          const isActive = tab === activeFilter;
          return (
            <Pressable
              key={tab}
              onPress={() => handleSelectFilter(tab)}
              style={[
                styles.filterTab,
                isActive && styles.filterTabActive,
              ]}
            >
              <Text
                style={[
                  styles.filterLabel,
                  isActive && styles.filterLabelActive,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {phrases.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>Nenhuma frase aqui</Text>
          <Text style={styles.emptyText}>
            Suas frases personalizadas aparecerão aqui
          </Text>
        </View>
      ) : (
        <FlatList
          data={phrases}
          keyExtractor={(_, idx) => `phrase-${idx}`}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: tabBarHeight + 16 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <PhraseCard phrase={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  filterBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  filterTabActive: {
    backgroundColor: "#E3F2FD",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  filterLabel: {
    fontFamily: "Dongle-Bold",
    fontSize: 13,
    color: colors.neutralDark,
    letterSpacing: 0.3,
  },
  filterLabelActive: {
    color: colors.primary,
  },
  listContent: {
    paddingTop: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontFamily: "Dongle-Bold",
    fontSize: 24,
    color: colors.dark,
  },
  emptyText: {
    fontFamily: "Dongle-Regular",
    fontSize: 18,
    color: colors.neutralDark,
    textAlign: "center",
    lineHeight: 22,
  },
});

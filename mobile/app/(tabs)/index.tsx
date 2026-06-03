import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useCategories } from "@/hooks/useCategories";
import { PecCard } from "@/components/PecCard";
import { SkeletonPecCard, SkeletonChip } from "@/components/SkeletonCard";
import { colors, getCategoryColor, getCategoryBgColor } from "@/constants/colors";
import { PecItem } from "@/types";

export default function PecsScreen() {
  const insets = useSafeAreaInsets();
  const { data: categories, isLoading, error, refetch } = useCategories();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSelectCategory = useCallback((index: number) => {
    setSelectedIndex(index);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const selectedCategory = categories?.[selectedIndex];
  const pecs: PecItem[] = selectedCategory?.pECS?.nodes ?? [];
  const categoryColorName =
    selectedCategory?.categoriasDePec?.configuracoesCategorias?.cor ?? "blue";
  const cardBg = getCategoryBgColor(categoryColorName);

  const tabBarHeight = Platform.OS === "web" ? 84 : 60 + insets.bottom;

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.neutralDark} />
        <Text style={styles.errorText}>Não foi possível carregar</Text>
        <Pressable style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonChip key={i} />)
            : categories?.map((cat, idx) => {
                const catColorName =
                  cat.categoriasDePec?.configuracoesCategorias?.cor ?? "blue";
                const catColor = getCategoryColor(catColorName);
                const catBg = getCategoryBgColor(catColorName);
                const isActive = idx === selectedIndex;
                const iconUrl =
                  cat.categoriasDePec?.configuracoesCategorias?.icone?.node?.mediaItemUrl;
                return (
                  <Pressable
                    key={cat.slug}
                    onPress={() => handleSelectCategory(idx)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isActive ? catBg : "#F5F5F5",
                        borderColor: isActive ? catColor : "transparent",
                        borderWidth: isActive ? 1.5 : 0,
                      },
                    ]}
                  >
                    {iconUrl ? (
                      <Image source={{ uri: iconUrl }} style={styles.chipIcon} />
                    ) : null}
                    <Text
                      style={[
                        styles.chipLabel,
                        { color: isActive ? catColor : colors.neutralDark },
                      ]}
                    >
                      {cat.name.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
        </ScrollView>
      </View>

      {isLoading ? (
        <FlatList
          key="skeleton"
          data={Array.from({ length: 6 })}
          keyExtractor={(_, i) => `skel-${i}`}
          numColumns={2}
          contentContainerStyle={[
            styles.gridContent,
            { paddingBottom: tabBarHeight + 16 },
          ]}
          renderItem={() => <SkeletonPecCard />}
        />
      ) : pecs.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="images-outline" size={48} color={colors.neutralDark} />
          <Text style={styles.emptyText}>Nenhum item nesta categoria</Text>
        </View>
      ) : (
        <FlatList
          key="pecs"
          data={pecs}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[
            styles.gridContent,
            { paddingBottom: tabBarHeight + 16 },
          ]}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <PecCard item={item} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
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
  chipsContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  chipsContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    flexDirection: "row",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
    gap: 5,
  },
  chipIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
  },
  chipLabel: {
    fontFamily: "Dongle-Bold",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  gridContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  cardWrapper: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    fontFamily: "Dongle-Regular",
    fontSize: 20,
    color: colors.neutralDark,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: "Dongle-Regular",
    fontSize: 20,
    color: colors.neutralDark,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 100,
  },
  retryText: {
    fontFamily: "Dongle-Bold",
    fontSize: 18,
    color: "#fff",
  },
});

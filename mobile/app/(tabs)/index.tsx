import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useCategories } from "@/hooks/useCategories";
import { PecCard } from "@/components/PecCard";
import { SkeletonPecCard, SkeletonChip } from "@/components/SkeletonCard";
import { colors, getCategoryColor, getCategoryBgColor } from "@/constants/colors";
import { PecItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 2;

export default function PecsScreen() {
  const insets = useSafeAreaInsets();
  const { data: categories, isLoading, error, refetch } = useCategories();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSelectCategory = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    []
  );

  const selectedCategory = categories?.[selectedIndex];
  const pecs: PecItem[] = selectedCategory?.pECS?.nodes ?? [];
  const categoryConfig =
    selectedCategory?.categoriasDePec?.configuracoesCategorias;
  const categoryColorName = categoryConfig?.cor ?? "blue";
  const cardBg = getCategoryBgColor(categoryColorName);

  const tabBarHeight = Platform.OS === "web" ? 34 + 68 : insets.bottom + 8 + 68;

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
    <View style={[styles.container, { backgroundColor: colors.neutralLight }]}>
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonChip key={i} />)
            : categories?.map((cat, idx) => {
                const catColor = getCategoryColor(
                  cat.categoriasDePec?.configuracoesCategorias?.cor ?? "blue"
                );
                const catBg = getCategoryBgColor(
                  cat.categoriasDePec?.configuracoesCategorias?.cor ?? "blue"
                );
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
                        backgroundColor: isActive
                          ? catBg
                          : `${catBg}88`,
                        borderColor: isActive ? catColor : "transparent",
                        borderWidth: isActive ? 1.5 : 0,
                      },
                    ]}
                  >
                    {iconUrl && (
                      <Image
                        source={{ uri: iconUrl }}
                        style={styles.chipIcon}
                      />
                    )}
                    <Text
                      style={[
                        styles.chipLabel,
                        { color: catColor, opacity: isActive ? 1 : 0.7 },
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
          numColumns={NUM_COLUMNS}
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
          numColumns={NUM_COLUMNS}
          contentContainerStyle={[
            styles.gridContent,
            { paddingBottom: tabBarHeight + 16 },
          ]}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <PecCard item={item} bgColor={cardBg} />
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
  },
  chipsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: `${colors.neutral}`,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 6,
  },
  chipIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: `${colors.neutralLight}99`,
  },
  chipLabel: {
    fontFamily: "Dongle-Bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  gridContent: {
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  cardWrapper: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
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

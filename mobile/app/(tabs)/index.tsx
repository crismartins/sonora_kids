import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useCategories } from "@/hooks/useCategories";
import { PecCard } from "@/components/PecCard";
import { SkeletonPecCard, SkeletonChip } from "@/components/SkeletonCard";
import { colors, getCategoryColor, getCategoryBgColor } from "@/constants/colors";
import { categoryIconBySlug } from "@/constants/categoryIcons";
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

  const tabBarHeight = Platform.OS === "web" ? 84 : 60 + insets.bottom;

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-white">
        <Ionicons name="cloud-offline-outline" size={48} color={colors.neutralDark} />
        <Text className="text-center font-dongle text-xl text-neutral-dark">
          Não foi possível carregar
        </Text>
        <Pressable
          className="mt-2 rounded-full bg-primary px-6 py-2.5"
          onPress={() => refetch()}
        >
          <Text className="font-dongle-bold text-lg text-white">Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="border-b border-[#F0F0F0] bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 6,
            flexDirection: "row",
          }}
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonChip key={i} />)
            : categories?.map((cat, idx) => {
                const catColorName =
                  cat.categoriasDePec?.configuracoesCategorias?.cor ?? "blue";
                const catColor = getCategoryColor(catColorName);
                const catBg = getCategoryBgColor(catColorName);
                const isActive = idx === selectedIndex;
                const iconSource = categoryIconBySlug[cat.slug];
                return (
                  <Pressable
                    key={cat.slug}
                    onPress={() => handleSelectCategory(idx)}
                    className="flex-row items-center gap-1.5 rounded-full px-3 py-[7px]"
                    style={{
                      backgroundColor: isActive ? catBg : "#F5F5F5",
                      borderColor: isActive ? catColor : "transparent",
                      borderWidth: isActive ? 1.5 : 0,
                    }}
                  >
                    {iconSource ? (
                      <Image source={iconSource} className="h-[22px] w-[22px] rounded-full bg-white" />
                    ) : null}
                    <Text
                      className="font-dongle-bold text-base tracking-wide"
                      style={{ color: isActive ? catColor : colors.neutralDark }}
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
          contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 10, paddingBottom: tabBarHeight + 16 }}
          renderItem={() => <SkeletonPecCard />}
        />
      ) : pecs.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 bg-white">
          <Ionicons name="images-outline" size={48} color={colors.neutralDark} />
          <Text className="font-dongle text-xl text-neutral-dark">
            Nenhum item nesta categoria
          </Text>
        </View>
      ) : (
        <FlatList
          key="pecs"
          data={pecs}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 10, paddingBottom: tabBarHeight + 16 }}
          renderItem={({ item }) => (
            <View className="flex-1">
              <PecCard item={item} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

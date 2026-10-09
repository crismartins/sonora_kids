import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  Image,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { useCategories } from "@/hooks/useCategories";
import { PecCard } from "@/components/PecCard";
import { PillText } from "@/components/PillText";
import { SkeletonPecCard, SkeletonChip } from "@/components/SkeletonCard";
import { colors, getCategoryColor, getCategoryBgColor } from "@/constants/colors";
import { categoryIconBySlug } from "@/constants/categoryIcons";
import { Category, PecItem } from "@/types";

const CATEGORY_ICON_SIZE = 33;
const CATEGORY_PILL_SIZE = 60;

export default function PecsScreen() {
  const insets = useSafeAreaInsets();
  const { data: categories, isLoading, error, refetch } = useCategories();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const chipScrollRef = useRef<ScrollView>(null);
  const pagerRef = useRef<ScrollView>(null);
  const chipLayouts = useRef<Record<number, { x: number; width: number }>>({});
  const chipViewportWidth = useRef(0);
  const selectedIndexRef = useRef(selectedIndex);
  const pageWidthRef = useRef(0);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  selectedIndexRef.current = selectedIndex;
  pageWidthRef.current = pageSize.width;

  const scrollToSelectedChip = useCallback((index: number) => {
    const layout = chipLayouts.current[index];
    const viewport = chipViewportWidth.current;
    if (!layout || !viewport || !chipScrollRef.current) return;
    const x = Math.max(0, layout.x - (viewport - layout.width) / 2);
    chipScrollRef.current.scrollTo({ x, animated: true });
  }, []);

  const selectCategory = useCallback(
    (index: number, source: "chip" | "pager") => {
      if (!categories || index < 0 || index >= categories.length) return;
      if (index === selectedIndexRef.current) return;
      setSelectedIndex(index);
      const name = categories[index]?.name;
      if (name) {
        Speech.stop();
        Speech.speak(name, { language: "pt-BR" });
      }
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      if (source === "chip" && pageWidthRef.current > 0) {
        pagerRef.current?.scrollTo({
          x: index * pageWidthRef.current,
          animated: true,
        });
      }
    },
    [categories],
  );

  const syncCategoryFromOffset = useCallback(
    (offsetX: number) => {
      const width = pageWidthRef.current;
      if (!width) return;
      const index = Math.round(offsetX / width);
      selectCategory(index, "pager");
    },
    [selectCategory],
  );

  const handlePagerScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
      scrollEndTimer.current = setTimeout(() => {
        syncCategoryFromOffset(offsetX);
      }, 80);
    },
    [syncCategoryFromOffset],
  );

  useEffect(() => {
    scrollToSelectedChip(selectedIndex);
  }, [selectedIndex, categories, scrollToSelectedChip]);

  useEffect(() => {
    if (!pageSize.width) return;
    pagerRef.current?.scrollTo({
      x: selectedIndexRef.current * pageSize.width,
      animated: false,
    });
  }, [pageSize.width]);

  useEffect(() => {
    return () => {
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    };
  }, []);

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
          ref={chipScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onLayout={(event) => {
            chipViewportWidth.current = event.nativeEvent.layout.width;
            scrollToSelectedChip(selectedIndexRef.current);
          }}
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
                    accessibilityLabel={cat.name}
                    onPress={() => selectCategory(idx, "chip")}
                    onLayout={(event) => {
                      const { x, width } = event.nativeEvent.layout;
                      chipLayouts.current[idx] = { x, width };
                      if (idx === selectedIndexRef.current) {
                        scrollToSelectedChip(idx);
                      }
                    }}
                    className="flex-row items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isActive ? catBg : "#F5F5F5",
                      height: CATEGORY_PILL_SIZE,
                      width: isActive ? undefined : CATEGORY_PILL_SIZE,
                      paddingHorizontal: isActive ? 18 : 0,
                      gap: isActive ? 9 : 0,
                    }}
                  >
                    {iconSource ? (
                      <View
                        className="items-center justify-center rounded-full bg-white"
                        style={{ width: CATEGORY_ICON_SIZE, height: CATEGORY_ICON_SIZE }}
                      >
                        <Image
                          source={iconSource}
                          style={{ width: CATEGORY_ICON_SIZE, height: CATEGORY_ICON_SIZE }}
                        />
                      </View>
                    ) : null}
                    {isActive ? (
                      <PillText
                        size={16}
                        style={{
                          color: catColor,
                          letterSpacing: 0.4,
                        }}
                      >
                        {cat.name.toUpperCase()}
                      </PillText>
                    ) : null}
                  </Pressable>
                );
              })}
        </ScrollView>
      </View>

      <View
        className="flex-1"
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setPageSize((current) =>
            current.width === width && current.height === height ? current : { width, height },
          );
        }}
      >
        {isLoading || pageSize.width === 0 ? (
          <FlatList
            key="skeleton"
            data={Array.from({ length: 6 })}
            keyExtractor={(_, i) => `skel-${i}`}
            numColumns={2}
            contentContainerStyle={{
              paddingHorizontal: 10,
              paddingTop: 10,
              paddingBottom: tabBarHeight + 16,
            }}
            renderItem={() => <SkeletonPecCard />}
          />
        ) : (
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onScroll={handlePagerScroll}
            onMomentumScrollEnd={(event) => {
              syncCategoryFromOffset(event.nativeEvent.contentOffset.x);
            }}
            scrollEventThrottle={16}
            style={{ width: pageSize.width, height: pageSize.height }}
          >
            {categories?.map((category) => (
              <CategoryPage
                key={category.slug}
                category={category}
                width={pageSize.width}
                height={pageSize.height}
                tabBarHeight={tabBarHeight}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

function CategoryPage({
  category,
  width,
  height,
  tabBarHeight,
}: {
  category: Category;
  width: number;
  height: number;
  tabBarHeight: number;
}) {
  const pecs: PecItem[] = category.pECS?.nodes ?? [];
  const colorName = category.categoriasDePec?.configuracoesCategorias?.cor ?? "blue";
  const backgroundColor = getCategoryBgColor(colorName);

  return (
    <View style={{ width, height }}>
      {pecs.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 bg-white">
          <Ionicons name="images-outline" size={48} color={colors.neutralDark} />
          <Text className="font-dongle text-xl text-neutral-dark">
            Nenhum item nesta categoria
          </Text>
        </View>
      ) : (
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingTop: 10,
            paddingBottom: tabBarHeight + 16,
          }}
        >
          <View className="flex-row flex-wrap">
            {pecs.map((item) => (
              <View key={item.id} className="w-1/2">
                <PecCard item={item} backgroundColor={backgroundColor} />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

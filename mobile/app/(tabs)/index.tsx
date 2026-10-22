import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { View, Text, FlatList, ScrollView, Pressable, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { SolarIcon } from "@/components/SolarIcon";
import { Button, FloatingButton } from "@/components/Button";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useCategories } from "@/hooks/useCategories";
import { useCustomPecs } from "@/hooks/useCustomPecs";
import { CustomPec, customPecToItem } from "@/services/customPecs";
import { PecCard } from "@/components/PecCard";
import { AddPecModal } from "@/components/AddPecModal";
import { PecActionsModal } from "@/components/PecActionsModal";
import { PillText } from "@/components/PillText";
import { SkeletonPecCard, SkeletonChip } from "@/components/SkeletonCard";
import { colors, getCategoryColor, getCategoryBgColor } from "@/constants/colors";
import { tabBarClearance } from "@/constants/tabBar";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categoryIconBySlug } from "@/constants/categoryIcons";
import { Category, PecItem } from "@/types";

const CATEGORY_ICON_SIZE = 33;
const CATEGORY_PILL_SIZE = 52;

export default function PecsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, speak, stopSpeaking, haptic } = useAppSettings();
  const { data: categories, isLoading, error, refetch } = useCategories();
  const { pecs: customPecs, addPec, updatePec, deletePec } = useCustomPecs();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [menuPec, setMenuPec] = useState<CustomPec | null>(null);
  const [editingPec, setEditingPec] = useState<CustomPec | null>(null);
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
      if (name && settings.autoSpeakCategories) {
        stopSpeaking();
        speak(name);
      }
      haptic(Haptics.ImpactFeedbackStyle.Light);
      if (source === "chip" && pageWidthRef.current > 0) {
        pagerRef.current?.scrollTo({
          x: index * pageWidthRef.current,
          animated: true,
        });
      }
    },
    [categories, haptic, settings.autoSpeakCategories, speak, stopSpeaking],
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

  const displayCategories = useMemo(() => {
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

  const tabBarHeight = tabBarClearance(insets.bottom);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-white">
        <SolarIcon name="cloud-cross" size={48} color={colors.neutralDark} />
        <Text className="text-center font-quicksand text-xl text-neutral-dark">Não foi possível carregar</Text>
        <Button label="Tentar novamente" size="md" className="mt-2 px-6" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white">
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
                const catColorName = cat.categoriasDePec?.configuracoesCategorias?.cor ?? "blue";
                const catColor = getCategoryColor(catColorName);
                const catBg = getCategoryBgColor(catColorName);
                const isActive = idx === selectedIndex;
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
                      backgroundColor: settings.highContrast
                        ? isActive
                          ? catColor
                          : catColor
                        : isActive
                          ? catBg
                          : catBg,
                      borderColor: catColor,
                      height: CATEGORY_PILL_SIZE,
                      width: isActive ? undefined : CATEGORY_PILL_SIZE,
                      paddingHorizontal: isActive ? 12 : 0,
                      gap: isActive ? 8 : 0,
                    }}
                  >
                    <View
                      className="items-center justify-center rounded-full bg-white/60"
                      style={{ width: CATEGORY_ICON_SIZE, height: CATEGORY_ICON_SIZE }}
                    >
                      {categoryIconBySlug[cat.slug] ? (
                        <CategoryIcon slug={cat.slug} size={CATEGORY_ICON_SIZE} />
                      ) : (
                        <PillText size={18} style={{ color: catColor }}>
                          {cat.name.slice(0, 1)}
                        </PillText>
                      )}
                    </View>
                    {isActive ? (
                      <PillText
                        size={16}
                        style={{
                          color: settings.highContrast && isActive ? "#FFFFFF" : catColor,
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
            {displayCategories?.map((category) => (
              <CategoryPage
                key={category.slug}
                category={category}
                width={pageSize.width}
                height={pageSize.height}
                tabBarHeight={tabBarHeight}
                onManageItem={(item) => {
                  const pec = customPecs.find((entry) => entry.id === item.id);
                  if (pec) setMenuPec(pec);
                }}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {!isLoading && categories ? (
        <FloatingButton
          icon="widget-add"
          accessibilityLabel="Adicionar PEC"
          onPress={() => setAddOpen(true)}
          bottom={tabBarHeight + 12}
        />
      ) : null}

      {categories ? (
        <AddPecModal
          visible={addOpen || !!editingPec}
          categories={categories}
          initialCategorySlug={editingPec?.categorySlug ?? categories[selectedIndex]?.slug ?? categories[0].slug}
          initialPec={editingPec}
          onClose={() => {
            setAddOpen(false);
            setEditingPec(null);
          }}
          onSubmit={async (input) => {
            if (editingPec) {
              await updatePec(editingPec.id, input);
            } else {
              await addPec(input);
            }
            const index = categories.findIndex((category) => category.slug === input.categorySlug);
            setAddOpen(false);
            setEditingPec(null);
            if (index >= 0) selectCategory(index, "chip");
          }}
        />
      ) : null}

      <PecActionsModal
        pec={menuPec}
        onClose={() => setMenuPec(null)}
        onEdit={(pec) => {
          setMenuPec(null);
          setEditingPec(pec);
        }}
        onDelete={async (pec) => {
          await deletePec(pec.id);
          setMenuPec(null);
        }}
      />
    </View>
  );
}

function chunkPairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
}

function CategoryPage({
  category,
  width,
  height,
  tabBarHeight,
  onManageItem,
}: {
  category: Category;
  width: number;
  height: number;
  tabBarHeight: number;
  onManageItem: (item: PecItem) => void;
}) {
  const pecs: PecItem[] = category.pECS?.nodes ?? [];
  const colorName = category.categoriasDePec?.configuracoesCategorias?.cor ?? "blue";
  const backgroundColor = getCategoryBgColor(colorName);

  return (
    <View style={{ width, height }}>
      {pecs.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 bg-white">
          <SolarIcon name="gallery" size={48} color={colors.neutralDark} />
          <Text className="font-quicksand text-xl text-neutral-dark">Nenhum item nesta categoria</Text>
        </View>
      ) : (
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingTop: 10,
            paddingBottom: tabBarHeight + 88,
          }}
        >
          {chunkPairs(pecs).map((row) => (
            <View key={row.map((item) => item.id).join("-")} className="flex-row items-stretch">
              {row.map((item) => (
                <View key={item.id} className="w-1/2 self-stretch">
                  <PecCard
                    item={item}
                    backgroundColor={backgroundColor}
                    colorName={colorName}
                    onLongPressManage={item.id.startsWith("custom-") ? () => onManageItem(item) : undefined}
                  />
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

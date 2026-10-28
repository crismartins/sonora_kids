import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { View, FlatList, ScrollView, NativeSyntheticEvent, NativeScrollEvent, type ScrollViewInstance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { FloatingButton } from "@/components/Button";
import { CategoryPill } from "@/components/CategoryPill";
import { EmptyState } from "@/components/ScreenState";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useCategories } from "@/hooks/useCategories";
import { useCustomPecs } from "@/hooks/useCustomPecs";
import { CustomPec, customPecToItem } from "@/services/customPecs";
import { PecCard } from "@/components/PecCard";
import { openPecForm } from "@/components/AddPecModal";
import { PecActionsModal } from "@/components/PecActionsModal";
import { SkeletonPecCard, SkeletonChip } from "@/components/SkeletonCard";
import { getCategoryBgColor } from "@/constants/colors";
import { tabBarClearance } from "@/constants/tabBar";
import { Category, PecItem } from "@/types";

export default function PecsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, speak, stopSpeaking, haptic } = useAppSettings();
  const { data: categories, isLoading, error, refetch } = useCategories();
  const { pecs: customPecs, addPec, updatePec, deletePec } = useCustomPecs();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuPec, setMenuPec] = useState<CustomPec | null>(null);
  const [editingPec, setEditingPec] = useState<CustomPec | null>(null);
  const pecFormOpen = useRef(false);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const chipScrollRef = useRef<ScrollViewInstance>(null);
  const pagerRef = useRef<ScrollViewInstance>(null);
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

  useEffect(() => {
    if (!editingPec || !categories || pecFormOpen.current) return;
    pecFormOpen.current = true;
    const pec = editingPec;
    let opened = false;
    const timer = setTimeout(() => {
      opened = true;
      openPecForm({
        categories,
        initialCategorySlug: pec.categorySlug,
        initialPec: pec,
        onSubmit: async (input) => {
          await updatePec(pec.id, input);
          const index = categories.findIndex((category) => category.slug === input.categorySlug);
          if (index >= 0) selectCategory(index, "chip");
        },
        onClose: () => {
          pecFormOpen.current = false;
          setEditingPec(null);
        },
      });
    }, 280);
    return () => {
      clearTimeout(timer);
      if (!opened) pecFormOpen.current = false;
    };
  }, [editingPec, categories, updatePec, selectCategory]);

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
      <View className="flex-1 bg-white">
        <EmptyState
          icon="cloud-cross"
          title="Não foi possível carregar"
          actionLabel="Tentar novamente"
          onAction={() => refetch()}
        />
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
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 8,
            flexDirection: "row",
          }}
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonChip key={i} />)
            : categories?.map((cat, idx) => (
                <CategoryPill
                  key={cat.slug}
                  slug={cat.slug}
                  name={cat.name}
                  colorName={cat.categoriasDePec?.configuracoesCategorias?.cor ?? "blue"}
                  selected={idx === selectedIndex}
                  highContrast={settings.highContrast}
                  size="lg"
                  onPress={() => selectCategory(idx, "chip")}
                  onLayout={(event) => {
                    const { x, width } = event.nativeEvent.layout;
                    chipLayouts.current[idx] = { x, width };
                    if (idx === selectedIndexRef.current) {
                      scrollToSelectedChip(idx);
                    }
                  }}
                />
              ))}
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
          onPress={() => {
            if (!categories?.length) return;
            openPecForm({
              categories,
              initialCategorySlug: categories[selectedIndex]?.slug ?? categories[0].slug,
              onSubmit: async (input) => {
                await addPec(input);
                const index = categories.findIndex((category) => category.slug === input.categorySlug);
                if (index >= 0) selectCategory(index, "chip");
              },
            });
          }}
          bottom={tabBarHeight + 12}
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
        <EmptyState icon="gallery" title="Nenhum item nesta categoria" />
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

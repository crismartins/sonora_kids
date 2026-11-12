import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { View, FlatList, ScrollView, ImageSourcePropType } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { FloatingButton } from "@/components/Button";
import { useAppSettings } from "@/context/AppSettingsContext";
import { usePremium } from "@/context/PremiumContext";
import { PhraseCard } from "@/components/PhraseCard";
import { FilterChip } from "@/components/FilterChip";
import { EmptyState } from "@/components/ScreenState";
import { openPhraseForm } from "@/components/AddPhraseModal";
import { PhraseActionsModal } from "@/components/PhraseActionsModal";
import { tabBarClearance } from "@/constants/tabBar";
import { PHRASES_MAIS_USADAS, PHRASES_TODAS } from "@/constants/phrases";
import { imageFromPec } from "@/data/pecImages";
import { usePecImageOverrides } from "@/hooks/usePecImageOverrides";
import { useProfile } from "@/context/ProfileContext";
import { useCategories } from "@/hooks/useCategories";
import { useCustomPecs } from "@/hooks/useCustomPecs";
import { useCustomPhrases } from "@/hooks/useCustomPhrases";
import { usePillPager } from "@/hooks/usePillPager";
import { useI18n } from "@/i18n";
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

function pecImageSource(pec: PecItem, sex: "menina" | "menino"): ImageSourcePropType | undefined {
  const source = imageFromPec(pec, sex);
  return source;
}

function PhrasePage({
  phrases,
  images,
  tabBarHeight,
  onManage,
}: {
  phrases: ListedPhrase[];
  images: Map<string, ImageSourcePropType>;
  tabBarHeight: number;
  onManage: (customId: string) => void;
}) {
  const copy = useI18n();
  if (phrases.length === 0) {
    return (
      <EmptyState
        icon="chat-square-line"
        title={copy.phrases.emptyTitle}
        detail={copy.phrases.emptyDetail}
      />
    );
  }

  return (
    <FlatList
      data={phrases}
      keyExtractor={(item) => item.key}
      nestedScrollEnabled
      directionalLockEnabled
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: tabBarHeight + 88 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const customId = item.customId;
        return (
          <View style={{ paddingHorizontal: 16 }}>
            <PhraseCard phrase={item.items} images={images} onManage={customId ? () => onManage(customId) : undefined} />
          </View>
        );
      }}
    />
  );
}

export default function FrasesScreen() {
  const insets = useSafeAreaInsets();
  const { settings, haptic, speak } = useAppSettings();
  const { canAdd, openPaywall } = usePremium();
  const copy = useI18n();
  const filters = copy.phrases.filters;
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const { profile } = useProfile();
  const pecImagesVersion = usePecImageOverrides();
  const { data: categories } = useCategories();
  const { pecs: customPecs } = useCustomPecs();
  const { phrases: customPhrases, addPhrase, updatePhrase, deletePhrase } = useCustomPhrases();
  const onFilterChange = useCallback(
    (index: number) => {
      haptic(Haptics.ImpactFeedbackStyle.Light);
      const label = filtersRef.current[index];
      if (label) speak(label);
    },
    [haptic, speak],
  );
  const {
    selectedIndex,
    pageSize,
    chipScrollRef,
    pagerRef,
    contentOffset,
    selectIndex,
    onPagerScroll,
    onPagerMomentumEnd,
    onChipRowLayout,
    onChipLayout,
    onPagerLayout,
  } = usePillPager(FILTER_TABS.length, 0, onFilterChange);
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

  const pecImages = useMemo(() => {
    const map = new Map<string, ImageSourcePropType>();
    for (const category of catalog ?? []) {
      for (const pec of category.pECS.nodes) {
        const source = pecImageSource(pec, profile.sex);
        if (!source) continue;
        map.set(pec.title.trim().toLocaleLowerCase("pt-BR"), source);
      }
    }
    return map;
  }, [catalog, pecImagesVersion, profile.sex]);

  const phrasePages = useMemo(() => {
    const mine: ListedPhrase[] = customPhrases.map((phrase) => ({
      key: phrase.id,
      items: phrase.items,
      customId: phrase.id,
    }));
    return {
      "MAIS USADAS": catalogRows(PHRASES_MAIS_USADAS[0].collection, "mais"),
      TODAS: catalogRows(PHRASES_TODAS[0].collection, "todas"),
      "MINHAS FRASES": mine,
    } satisfies Record<FilterTab, ListedPhrase[]>;
  }, [customPhrases]);

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
          key={settings.language}
          ref={chipScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onLayout={onChipRowLayout}
          contentContainerStyle={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          {filters.map((label, index) => (
            <FilterChip
              key={`${settings.language}-${index}`}
              label={label}
              selected={index === selectedIndex}
              onPress={() => selectIndex(index, "chip")}
              onLayout={(event) => onChipLayout(index, event)}
            />
          ))}
        </ScrollView>
      </View>

      <View className="flex-1" onLayout={onPagerLayout}>
        {pageSize.width === 0 ? (
          <PhrasePage
            phrases={phrasePages[FILTER_TABS[selectedIndex]]}
            images={pecImages}
            tabBarHeight={tabBarHeight}
            onManage={openManage}
          />
        ) : (
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            directionalLockEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onScroll={onPagerScroll}
            onMomentumScrollEnd={onPagerMomentumEnd}
            scrollEventThrottle={16}
            contentOffset={contentOffset}
            style={{ width: pageSize.width, height: pageSize.height }}
          >
            {FILTER_TABS.map((tab) => (
              <View key={tab} style={{ width: pageSize.width, height: pageSize.height }}>
                <PhrasePage
                  phrases={phrasePages[tab]}
                  images={pecImages}
                  tabBarHeight={tabBarHeight}
                  onManage={openManage}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <FloatingButton
        icon="chat-square-add"
        tooltip={copy.common.add}
        accessibilityLabel={copy.phrases.add}
        onPress={() => {
          if (!catalog) return;
          if (!canAdd("phrase", customPhrases.length)) {
            openPaywall();
            return;
          }
          openPhraseForm({
            categories: catalog,
            onSubmit: async (items) => {
              await addPhrase(items);
              selectIndex(FILTER_TABS.indexOf("MINHAS FRASES"), "chip");
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

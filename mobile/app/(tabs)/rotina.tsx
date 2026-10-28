import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, ImageSourcePropType } from "react-native";
import { useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { SolarIcon, SolarIconName } from "@/components/SolarIcon";
import { BottomSheet } from "@/components/AppModal";
import { Button, FloatingButton } from "@/components/Button";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useCategories } from "@/hooks/useCategories";
import { useCustomPecs } from "@/hooks/useCustomPecs";
import { useRoutine } from "@/hooks/useRoutine";
import { usePillPager } from "@/hooks/usePillPager";
import { RoutinePecCard } from "@/components/PecCard";
import { openRoutineForm, RoutinePecOption, RoutinePick } from "@/components/AddRoutineItemModal";
import { FilterChip } from "@/components/FilterChip";
import { PillText } from "@/components/PillText";
import { EmptyState } from "@/components/ScreenState";
import { colors } from "@/constants/colors";
import { tabBarClearance } from "@/constants/tabBar";
import { customPecToItem } from "@/services/customPecs";
import { DAY_LABELS, DAY_PERIODS, DayPeriod, PERIOD_LABELS, RoutineItem } from "@/services/routine";
import { PecItem } from "@/types";

const DAY_CHIPS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const DIA_A_DIA = "dia-a-dia";

const PERIOD_TABS: { period: DayPeriod; icon: SolarIconName }[] = [
  { period: "manha", icon: "sun" },
  { period: "tarde", icon: "cloud-sun" },
  { period: "noite", icon: "moon" },
];

function chunkPairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
}

function currentPeriod(date = new Date()): DayPeriod {
  const hour = date.getHours();
  if (hour < 12) return "manha";
  if (hour < 18) return "tarde";
  return "noite";
}

interface RemoveFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

function frameContains(frame: RemoveFrame, pageX: number, pageY: number) {
  const pad = 10;
  return (
    pageX >= frame.x - pad &&
    pageX <= frame.x + frame.width + pad &&
    pageY >= frame.y - pad &&
    pageY <= frame.y + frame.height + pad
  );
}

function pecImage(item: PecItem): ImageSourcePropType | undefined {
  if (item.localImage) return item.localImage;
  const uri = item.featuredImage?.node?.sourceUrl;
  return uri ? { uri } : undefined;
}

function RoutineDayPage({
  items,
  dayColor,
  imageById,
  editing,
  tabBarHeight,
  onBeginEditing,
  onCancelEditing,
  onRemoveFrame,
  onRemove,
}: {
  items: RoutineItem[];
  dayColor: string;
  imageById: Map<string, ImageSourcePropType>;
  editing: boolean;
  tabBarHeight: number;
  onBeginEditing: () => void;
  onCancelEditing: () => void;
  onRemoveFrame: (id: string, frame: RemoveFrame) => void;
  onRemove: (item: RoutineItem) => void;
}) {
  return (
    <ScrollView
      nestedScrollEnabled
      directionalLockEnabled
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flexGrow: 1,
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: tabBarHeight + 16,
        }}
      >
        {items.length > 0 ? (
          chunkPairs(items).map((row) => (
            <View key={row.map((item) => item.id).join("-")} className="flex-row items-stretch">
              {row.map((item) => (
                <View key={item.id} className="w-1/2 self-stretch">
                  <RoutinePecCard
                    id={item.id}
                    title={item.title}
                    color={dayColor}
                    image={imageById.get(item.pecId)}
                    editing={editing}
                    onLongPress={onBeginEditing}
                    onCancelEditing={onCancelEditing}
                    onRemoveFrame={(frame) => onRemoveFrame(item.id, frame)}
                    onRemove={() => onRemove(item)}
                  />
                </View>
              ))}
            </View>
          ))
        ) : (
          <EmptyState icon="clock" title="Nada nesta parte do dia" detail="Toque no lápis e escolha os PECs" />
        )}
      </View>
    </ScrollView>
  );
}

export default function RotinaScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { speak, haptic } = useAppSettings();
  const { data: categories } = useCategories();
  const { pecs: customPecs, addPec } = useCustomPecs();
  const { itemsFor, addItem, removeItem } = useRoutine();
  const today = new Date().getDay();
  const onDayChange = useCallback(
    (index: number) => {
      haptic(Haptics.ImpactFeedbackStyle.Light);
      speak(DAY_LABELS[index]);
    },
    [haptic, speak],
  );
  const {
    selectedIndex: selectedDay,
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
  } = usePillPager(DAY_CHIPS.length, today, onDayChange);
  const [selectedPeriod, setSelectedPeriod] = useState<DayPeriod>(currentPeriod);
  const [removing, setRemoving] = useState<{ period: DayPeriod; item: RoutineItem } | null>(null);
  const [editing, setEditing] = useState(false);
  const [removeFrames, setRemoveFrames] = useState<Record<string, RemoveFrame>>({});
  const ignoreCancelUntil = useRef(0);

  const dayCategory = categories?.find((category) => category.slug === DIA_A_DIA);
  const dayColor = dayCategory?.categoriasDePec?.configuracoesCategorias?.cor ?? "deepPurple";
  const catalog = useMemo(() => {
    if (!categories) return [];
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
  const catalogRef = useRef(catalog);
  catalogRef.current = catalog;

  const options = useMemo(() => {
    const catalog = dayCategory?.pECS.nodes ?? [];
    const custom = customPecs.filter((pec) => pec.categorySlug === DIA_A_DIA).map(customPecToItem);
    const byId = new Map<string, RoutinePecOption>();
    for (const item of [...catalog, ...custom]) {
      byId.set(item.id, { id: item.id, title: item.title, image: pecImage(item) });
    }
    return [...byId.values()];
  }, [customPecs, dayCategory]);

  const imageById = useMemo(() => {
    const map = new Map<string, ImageSourcePropType>();
    for (const option of options) {
      if (option.image) map.set(option.id, option.image);
    }
    return map;
  }, [options]);

  const tabBarHeight = tabBarClearance(insets.bottom);

  const beginEditing = () => {
    ignoreCancelUntil.current = Date.now() + 500;
    haptic();
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setRemoveFrames({});
  };

  const rememberRemoveFrame = (id: string, frame: RemoveFrame) => {
    setRemoveFrames((current) => {
      const previous = current[id];
      if (
        previous &&
        previous.x === frame.x &&
        previous.y === frame.y &&
        previous.width === frame.width &&
        previous.height === frame.height
      ) {
        return current;
      }
      return { ...current, [id]: frame };
    });
  };

  const itemAtPoint = (pageX: number, pageY: number) => {
    const hitId = Object.keys(removeFrames).find((id) => frameContains(removeFrames[id], pageX, pageY));
    if (!hitId) return null;
    for (const period of DAY_PERIODS) {
      const item = itemsFor(selectedDay, period).find((entry) => entry.id === hitId);
      if (item) return { period, item };
    }
    return null;
  };

  useEffect(() => {
    return navigation.addListener("blur", cancelEditing);
  }, [navigation]);

  const describePick = (pecId: string, title: string): RoutinePick => {
    for (const category of catalogRef.current) {
      const pec = category.pECS.nodes.find((item) => item.id === pecId);
      if (!pec) continue;
      return {
        id: pecId,
        title,
        image: pec.featuredImage?.node?.sourceUrl,
        color: category.categoriasDePec?.configuracoesCategorias?.cor ?? "blue",
      };
    }
    return { id: pecId, title, color: dayColor };
  };

  const openPeriod = (period: DayPeriod) => {
    if (editing) {
      cancelEditing();
      return;
    }
    if (catalogRef.current.length === 0) return;
    const day = selectedDay;
    const saved = itemsFor(day, period);
    openRoutineForm({
      day,
      period,
      initialSelected: saved.map((item) => describePick(item.pecId, item.title)),
      getCategories: () => catalogRef.current,
      addPec,
      onSubmit: async (chosen) => {
        const current = itemsFor(day, period);
        const savedIds = new Set(current.map((item) => item.pecId));
        const chosenIds = new Set(chosen.map((item) => item.id));
        for (const pick of chosen) {
          if (!savedIds.has(pick.id)) await addItem(day, period, { id: pick.id, title: pick.title });
        }
        for (const item of current) {
          if (!chosenIds.has(item.pecId)) await removeItem(day, period, item.id);
        }
      },
    });
    haptic(Haptics.ImpactFeedbackStyle.Light);
  };

  const selectPeriod = (period: DayPeriod) => {
    if (editing) {
      cancelEditing();
      return;
    }
    setSelectedPeriod(period);
    haptic(Haptics.ImpactFeedbackStyle.Light);
    speak(PERIOD_LABELS[period]);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white">
        <ScrollView
          ref={chipScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onLayout={onChipRowLayout}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 8,
            flexDirection: "row",
          }}
        >
          {DAY_CHIPS.map((day, index) => (
            <FilterChip
              key={day}
              label={day}
              accessibilityLabel={DAY_LABELS[index]}
              selected={index === selectedDay}
              onPress={() => {
                if (editing) {
                  cancelEditing();
                  return;
                }
                selectIndex(index, "chip");
              }}
              onLayout={(event) => onChipLayout(index, event)}
            />
          ))}
        </ScrollView>
      </View>

      <View className="flex-row border-b border-line bg-white">
        {PERIOD_TABS.map(({ period, icon }) => {
          const active = period === selectedPeriod;
          const tint = active ? colors.primary : colors.neutralDark;
          return (
            <Pressable
              key={period}
              accessibilityLabel={PERIOD_LABELS[period]}
              accessibilityState={{ selected: active }}
              onPress={() => selectPeriod(period)}
              className={`flex-1 items-center justify-center gap-0.5 py-2 ${active ? "bg-primary-soft" : ""}`}
            >
              <SolarIcon name={icon} size={24} color={tint} />
              <PillText size={16} style={{ color: tint }}>
                {PERIOD_LABELS[period]}
              </PillText>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-1" onLayout={onPagerLayout}>
        {pageSize.width === 0 ? (
          <RoutineDayPage
            items={itemsFor(selectedDay, selectedPeriod)}
            dayColor={dayColor}
            imageById={imageById}
            editing={editing}
            tabBarHeight={tabBarHeight}
            onBeginEditing={beginEditing}
            onCancelEditing={cancelEditing}
            onRemoveFrame={rememberRemoveFrame}
            onRemove={(item) => {
              haptic();
              setRemoving({ period: selectedPeriod, item });
            }}
          />
        ) : (
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            directionalLockEnabled
            scrollEnabled={!editing}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onScroll={onPagerScroll}
            onMomentumScrollEnd={onPagerMomentumEnd}
            scrollEventThrottle={16}
            contentOffset={contentOffset}
            style={{ width: pageSize.width, height: pageSize.height }}
          >
            {DAY_CHIPS.map((day, index) => (
              <View key={day} style={{ width: pageSize.width, height: pageSize.height }}>
                <RoutineDayPage
                  items={itemsFor(index, selectedPeriod)}
                  dayColor={dayColor}
                  imageById={imageById}
                  editing={editing && index === selectedDay}
                  tabBarHeight={tabBarHeight}
                  onBeginEditing={beginEditing}
                  onCancelEditing={cancelEditing}
                  onRemoveFrame={rememberRemoveFrame}
                  onRemove={(item) => {
                    haptic();
                    setRemoving({ period: selectedPeriod, item });
                  }}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <FloatingButton
        icon="pen"
        iconSize={26}
        accessibilityLabel={`Editar ${PERIOD_LABELS[selectedPeriod]}`}
        onPress={() => openPeriod(selectedPeriod)}
        bottom={tabBarHeight + 12}
      />

      <Modal visible={editing && !removing} transparent animationType="none" onRequestClose={cancelEditing}>
        <Pressable
          accessibilityLabel="Cancelar remoção"
          style={{ flex: 1 }}
          onPress={(event) => {
            const match = itemAtPoint(event.nativeEvent.pageX, event.nativeEvent.pageY);
            if (!match) {
              if (Date.now() < ignoreCancelUntil.current) return;
              cancelEditing();
              return;
            }
            haptic();
            setRemoving(match);
          }}
        />
      </Modal>

      <BottomSheet
        visible={!!removing}
        title={removing?.item.title}
        onClose={() => {
          setRemoving(null);
          cancelEditing();
        }}
      >
        <View className="gap-3">
          <Text className="text-center font-quicksand text-xl text-neutral-dark">
            Tirar de {removing ? PERIOD_LABELS[removing.period] : ""}? O PEC continua em Dia a Dia.
          </Text>
          <Button
            label="Tirar da rotina"
            variant="danger"
            accessibilityLabel="Tirar da rotina"
            onPress={async () => {
              if (!removing) return;
              await removeItem(selectedDay, removing.period, removing.item.id);
              setRemoving(null);
            }}
          />
          <Button
            label="Cancelar"
            variant="muted"
            onPress={() => {
              setRemoving(null);
              cancelEditing();
            }}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

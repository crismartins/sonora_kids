import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, ImageSourcePropType } from "react-native";
import { useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { SolarIcon, SolarIconName } from "@/components/SolarIcon";
import { Button, FloatingButton } from "@/components/Button";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useCategories } from "@/hooks/useCategories";
import { useCustomPecs } from "@/hooks/useCustomPecs";
import { useRoutine } from "@/hooks/useRoutine";
import { RoutinePecCard } from "@/components/PecCard";
import { AddRoutineItemModal, RoutinePecOption } from "@/components/AddRoutineItemModal";
import { AddPecModal } from "@/components/AddPecModal";
import { PillText } from "@/components/PillText";
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

export default function RotinaScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { speak, haptic } = useAppSettings();
  const { data: categories } = useCategories();
  const { pecs: customPecs, addPec } = useCustomPecs();
  const { itemsFor, addItem, removeItem } = useRoutine();
  const today = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(today);
  const [selectedPeriod, setSelectedPeriod] = useState<DayPeriod>(currentPeriod);
  const [addingPeriod, setAddingPeriod] = useState<DayPeriod | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<{ period: DayPeriod; item: RoutineItem } | null>(null);
  const [editing, setEditing] = useState(false);
  const [removeFrames, setRemoveFrames] = useState<Record<string, RemoveFrame>>({});
  const ignoreCancelUntil = useRef(0);

  const dayCategory = categories?.find((category) => category.slug === DIA_A_DIA);
  const dayColor = dayCategory?.categoriasDePec?.configuracoesCategorias?.cor ?? "deepPurple";

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

  const openPeriod = (period: DayPeriod) => {
    if (editing) {
      cancelEditing();
      return;
    }
    setSelectedIds(itemsFor(selectedDay, period).map((item) => item.pecId));
    setAddingPeriod(period);
    haptic(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleSelected = (option: RoutinePecOption) => {
    setSelectedIds((current) =>
      current.includes(option.id) ? current.filter((id) => id !== option.id) : [...current, option.id],
    );
    haptic(Haptics.ImpactFeedbackStyle.Light);
  };

  const confirmSelection = async () => {
    if (!addingPeriod) return;
    const saved = itemsFor(selectedDay, addingPeriod);
    const savedIds = new Set(saved.map((item) => item.pecId));
    const chosen = new Set(selectedIds);
    for (const option of options) {
      if (chosen.has(option.id) && !savedIds.has(option.id)) {
        await addItem(selectedDay, addingPeriod, option);
      }
    }
    for (const item of saved) {
      if (!chosen.has(item.pecId)) {
        await removeItem(selectedDay, addingPeriod, item.id);
      }
    }
    setSelectedIds([]);
    setAddingPeriod(null);
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
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 6,
            flexDirection: "row",
          }}
        >
          {DAY_CHIPS.map((day, index) => {
            const isActive = index === selectedDay;
            return (
              <Pressable
                key={day}
                accessibilityLabel={DAY_LABELS[index]}
                onPress={() => {
                  if (editing) {
                    cancelEditing();
                    return;
                  }
                  setSelectedDay(index);
                  haptic(Haptics.ImpactFeedbackStyle.Light);
                  speak(DAY_LABELS[index]);
                }}
                className={`h-10 items-center justify-center rounded-full px-3.5 ${
                  isActive ? "bg-primary-wash" : "bg-muted"
                }`}
              >
                <PillText
                  size={16}
                  style={{
                    color: isActive ? colors.primary : colors.neutralDark,
                    letterSpacing: 0.4,
                  }}
                >
                  {day}
                </PillText>
              </Pressable>
            );
          })}
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
              className={`flex-1 items-center justify-center gap-0.5 py-2 ${
                active ? "bg-[#F7FBFF]" : "border-transparent"
              }`}
            >
              <SolarIcon name={icon} size={22} color={tint} />
              <PillText size={16} style={{ color: tint }}>
                {PERIOD_LABELS[period]}
              </PillText>
            </Pressable>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={{
            flexGrow: 1,
            paddingHorizontal: 12,
            paddingTop: 12,
            paddingBottom: tabBarHeight + 16,
          }}
        >
          {itemsFor(selectedDay, selectedPeriod).length > 0
            ? chunkPairs(itemsFor(selectedDay, selectedPeriod)).map((row) => (
                <View key={row.map((item) => item.id).join("-")} className="flex-row items-stretch">
                  {row.map((item) => (
                    <View key={item.id} className="w-1/2 self-stretch">
                      <RoutinePecCard
                        id={item.id}
                        title={item.title}
                        color={dayColor}
                        image={imageById.get(item.pecId)}
                        editing={editing}
                        onLongPress={beginEditing}
                        onCancelEditing={cancelEditing}
                        onRemoveFrame={(frame) => rememberRemoveFrame(item.id, frame)}
                        onRemove={() => {
                          haptic();
                          setRemoving({ period: selectedPeriod, item });
                        }}
                      />
                    </View>
                  ))}
                </View>
              ))
            : null}
        </View>
      </ScrollView>

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

      <AddRoutineItemModal
        visible={addingPeriod != null && !creating}
        title={addingPeriod ? `${PERIOD_LABELS[addingPeriod]} · ${DAY_LABELS[selectedDay]}` : "Rotina"}
        options={options}
        selectedIds={selectedIds}
        onClose={() => {
          setSelectedIds([]);
          setAddingPeriod(null);
        }}
        onToggle={toggleSelected}
        onConfirm={confirmSelection}
        onCreate={() => setCreating(true)}
      />

      {dayCategory ? (
        <AddPecModal
          visible={creating}
          categories={[dayCategory]}
          initialCategorySlug={DIA_A_DIA}
          onClose={() => setCreating(false)}
          onSubmit={async (input) => {
            const pec = await addPec({ ...input, categorySlug: DIA_A_DIA });
            setSelectedIds((current) => (current.includes(pec.id) ? current : [...current, pec.id]));
            setCreating(false);
          }}
        />
      ) : null}

      <Modal
        visible={!!removing}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setRemoving(null);
          cancelEditing();
        }}
      >
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityLabel="Fechar"
            onPress={() => {
              setRemoving(null);
              cancelEditing();
            }}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          />
          <View className="gap-3 rounded-t-[28px] bg-white px-5 pt-3" style={{ paddingBottom: insets.bottom + 20 }}>
            <View className="mb-1 h-1.5 w-12 self-center rounded-full bg-neutral" />
            <Text className="text-center font-quicksand text-3xl text-dark">{removing?.item.title}</Text>
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
        </View>
      </Modal>
    </View>
  );
}

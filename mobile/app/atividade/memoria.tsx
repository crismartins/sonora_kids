import React, { useEffect, useRef, useState } from "react";
import { View, Image, Pressable, Platform, ImageSourcePropType } from "react-native";
import * as Haptics from "expo-haptics";
import { SolarIcon } from "@/components/SolarIcon";
import { PillText } from "@/components/PillText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityChrome, ActivityDone, ActivityPrompt, activityPadding } from "@/components/activities/ActivityChrome";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useI18n } from "@/i18n";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { playPecs, sample, shuffle } from "@/data/play";
import { pecLabel } from "@/data/pecLabels";
import { AVATAR_V3, ChildSex } from "@/services/profile";
import { recordWordUse } from "@/services/wordUsage";

const PAIR_COUNT = 4;
const GRID_COLUMNS = 2;
const GRID_GAP = 12;

type MemoryCard = {
  key: string;
  pairId: string;
  title: string;
  colorName: string;
  image: ImageSourcePropType;
  faceUp: boolean;
  matched: boolean;
};

function deal(sex: ChildSex): MemoryCard[] {
  const picked = sample(playPecs(sex), PAIR_COUNT);
  const cards = picked.flatMap((pec, index) =>
    [0, 1].map((copy) => ({
      key: `${pec.id}-${index}-${copy}`,
      pairId: pec.id,
      title: pec.title,
      colorName: pec.colorName,
      image: pec.image,
      faceUp: false,
      matched: false,
    })),
  );
  return shuffle(cards);
}

export default function MemoriaScreen() {
  const insets = useSafeAreaInsets();
  const { settings, speak, haptic } = useAppSettings();
  const copy = useI18n();
  const { profile } = useProfile();
  const [cards, setCards] = useState<MemoryCard[]>(() => deal(profile.sex));
  const [finished, setFinished] = useState(false);
  const [board, setBoard] = useState({ width: 0, height: 0 });
  const lock = useRef(false);
  const openRef = useRef<MemoryCard | null>(null);
  const dealId = useRef(0);
  const dealtSex = useRef(profile.sex);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const found = cards.filter((card) => card.matched).length / 2;

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (dealtSex.current === profile.sex) return;
    dealtSex.current = profile.sex;
    dealId.current += 1;
    lock.current = false;
    openRef.current = null;
    if (timer.current) clearTimeout(timer.current);
    setFinished(false);
    setCards(deal(profile.sex));
  }, [profile.sex]);

  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.matched)) {
      setFinished(true);
    }
  }, [cards]);

  const celebrate = () => {
    if (!settings.haptics || Platform.OS === "web") return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const restart = () => {
    dealId.current += 1;
    lock.current = false;
    openRef.current = null;
    if (timer.current) clearTimeout(timer.current);
    setFinished(false);
    setCards(deal(profile.sex));
  };

  const flip = (card: MemoryCard) => {
    if (lock.current || openRef.current?.key === card.key || card.faceUp || card.matched) return;

    setCards((current) => current.map((item) => (item.key === card.key ? { ...item, faceUp: true } : item)));
    speak(pecLabel(card.title, profile.sex));
    haptic(Haptics.ImpactFeedbackStyle.Light);

    const first = openRef.current;
    if (!first) {
      openRef.current = card;
      return;
    }

    openRef.current = null;
    lock.current = true;
    const matched = first.pairId === card.pairId;
    const stamp = dealId.current;

    timer.current = setTimeout(
      () => {
        if (dealId.current !== stamp) return;
        setCards((current) =>
          current.map((item) => {
            if (matched && item.pairId === first.pairId) {
              return { ...item, faceUp: true, matched: true };
            }
            if (!matched && (item.key === first.key || item.key === card.key)) {
              return { ...item, faceUp: false };
            }
            return item;
          }),
        );
        lock.current = false;
        if (matched) {
          celebrate();
          recordWordUse(first.title, first.colorName);
        }
      },
      matched ? 420 : 900,
    );
  };

  const rows: MemoryCard[][] = [];
  for (let i = 0; i < cards.length; i += GRID_COLUMNS) {
    rows.push(cards.slice(i, i + GRID_COLUMNS));
  }

  const cardSize =
    board.width > 0 && board.height > 0 && rows.length > 0
      ? Math.floor(
          Math.min(
            (board.width - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
            (board.height - GRID_GAP * (rows.length - 1)) / rows.length,
          ),
        )
      : 0;

  return (
    <ActivityChrome title={copy.learn.memory}>
      {finished ? (
        <ActivityDone
          title={copy.learn.memoryDone}
          detail={copy.learn.memoryDoneDetail(PAIR_COUNT)}
          againLabel={copy.learn.memoryAgain}
          onAgain={restart}
        />
      ) : (
        <View className="flex-1" style={activityPadding(insets.bottom)}>
          <ActivityPrompt instruction={copy.learn.memoryPrompt} steps={{ done: found, total: PAIR_COUNT }} />
          <View
            className="flex-1 items-center justify-center"
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setBoard((current) =>
                current.width === width && current.height === height ? current : { width, height },
              );
            }}
          >
            {cardSize > 0 ? (
              <View style={{ gap: GRID_GAP }}>
                {rows.map((row) => (
                  <View key={row.map((card) => card.key).join("-")} className="flex-row" style={{ gap: GRID_GAP }}>
                    {row.map((card) => (
                      <View key={card.key} style={{ width: cardSize, height: cardSize }}>
                        <MemoryTile card={card} highContrast={settings.highContrast} onPress={() => flip(card)} />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      )}
    </ActivityChrome>
  );
}

function MemoryTile({ card, highContrast, onPress }: { card: MemoryCard; highContrast: boolean; onPress: () => void }) {
  const { profile } = useProfile();
  const copy = useI18n();
  const label = pecLabel(card.title, profile.sex);
  const color = getCategoryColor(card.colorName);
  const background = highContrast ? colors.white : getCategoryBgColor(card.colorName);
  const showing = card.faceUp || card.matched;

  return (
    <Pressable
      accessibilityLabel={showing ? label : copy.learn.faceDown}
      onPress={onPress}
      className={`h-full w-full overflow-hidden rounded-[22px] active:opacity-90 ${showing ? "px-2 pb-2 pt-2" : ""}`}
      style={{
        backgroundColor: showing ? background : colors.primary,
        borderWidth: showing && (card.matched || highContrast) ? 3 : 0,
        borderColor: color,
      }}
    >
      {showing ? (
        <View className="w-full flex-1 items-center">
          <View className="mb-1.5 w-full flex-1 overflow-hidden rounded-2xl bg-white">
            <Image source={card.image} className="h-full w-full" resizeMode="cover" />
          </View>
          <PillText size={16} numberOfLines={2} style={{ color: colors.dark }}>
            {label}
          </PillText>
        </View>
      ) : (
        <Image source={AVATAR_V3} className="h-full w-full" resizeMode="cover" />
      )}
      {card.matched ? (
        <View className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white">
          <SolarIcon name="check-circle" size={20} color={color} />
        </View>
      ) : null}
    </Pressable>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { View, Image, Pressable, Platform, ImageSourcePropType } from "react-native";
import * as Haptics from "expo-haptics";
import { SolarIcon } from "@/components/SolarIcon";
import { PillText } from "@/components/PillText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityChrome, ActivityDone, ActivityPrompt, activityPadding } from "@/components/activities/ActivityChrome";
import { useAppSettings } from "@/context/AppSettingsContext";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { playPecs, sample, shuffle } from "@/data/play";
import { recordWordUse } from "@/services/wordUsage";

const PAIR_COUNT = 4;

type MemoryCard = {
  key: string;
  pairId: string;
  title: string;
  colorName: string;
  image: ImageSourcePropType;
  faceUp: boolean;
  matched: boolean;
};

function deal(): MemoryCard[] {
  const picked = sample(playPecs(), PAIR_COUNT);
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
  const [cards, setCards] = useState<MemoryCard[]>(() => deal());
  const [finished, setFinished] = useState(false);
  const lock = useRef(false);
  const openRef = useRef<MemoryCard | null>(null);
  const dealId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const found = cards.filter((card) => card.matched).length / 2;

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

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
    setCards(deal());
  };

  const flip = (card: MemoryCard) => {
    if (lock.current || openRef.current?.key === card.key || card.faceUp || card.matched) return;

    setCards((current) => current.map((item) => (item.key === card.key ? { ...item, faceUp: true } : item)));
    speak(card.title);
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
  for (let i = 0; i < cards.length; i += 2) {
    rows.push(cards.slice(i, i + 2));
  }

  return (
    <ActivityChrome title="Memória com Pecs">
      {finished ? (
        <ActivityDone
          title="Você achou todos!"
          detail={`${PAIR_COUNT} pares de palavras`}
          againLabel="Jogar de novo"
          onAgain={restart}
        />
      ) : (
        <View className="flex-1" style={activityPadding(insets.bottom)}>
          <ActivityPrompt instruction="Toque em duas cartas iguais" progress={`${found} de ${PAIR_COUNT}`} />
          <View className="flex-1 gap-3">
            {rows.map((row) => (
              <View key={row.map((card) => card.key).join("-")} className="flex-1 flex-row gap-3">
                {row.map((card) => (
                  <View key={card.key} className="flex-1">
                    <MemoryTile card={card} highContrast={settings.highContrast} onPress={() => flip(card)} />
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      )}
    </ActivityChrome>
  );
}

function MemoryTile({ card, highContrast, onPress }: { card: MemoryCard; highContrast: boolean; onPress: () => void }) {
  const color = getCategoryColor(card.colorName);
  const background = highContrast ? colors.white : getCategoryBgColor(card.colorName);
  const showing = card.faceUp || card.matched;

  return (
    <Pressable
      accessibilityLabel={showing ? card.title : "Carta virada"}
      onPress={onPress}
      className={`flex-1 overflow-hidden rounded-[22px] active:opacity-90 ${showing ? "px-2 pb-2 pt-2" : "items-center justify-center"}`}
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
            {card.title}
          </PillText>
        </View>
      ) : (
        <SolarIcon name="star" size={36} color={colors.white} />
      )}
      {card.matched ? (
        <View className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white">
          <SolarIcon name="check" size={20} color={color} />
        </View>
      ) : null}
    </Pressable>
  );
}

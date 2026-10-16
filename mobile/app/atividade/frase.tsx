import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityChrome, ActivityDone } from "@/components/activities/ActivityChrome";
import { useAppSettings } from "@/context/AppSettingsContext";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { PHRASES_MAIS_USADAS } from "@/constants/phrases";
import { sample, shuffle } from "@/data/play";
import { recordWordUse } from "@/services/wordUsage";
import { PhraseItem } from "@/types";

const ROUND_COUNT = 4;

type Chip = PhraseItem & { id: string; order: number };

function pickPhrases(): PhraseItem[][] {
  const pool = PHRASES_MAIS_USADAS[0].collection.filter(
    (phrase) => phrase.length >= 2 && phrase.length <= 4,
  );
  return sample(pool, ROUND_COUNT);
}

function chipsFor(phrase: PhraseItem[]): Chip[] {
  return shuffle(
    phrase.map((item, order) => ({
      ...item,
      id: `${order}-${item.text}`,
      order,
    })),
  );
}

export default function FraseScreen() {
  const insets = useSafeAreaInsets();
  const { settings, speak, haptic } = useAppSettings();
  const [session, setSession] = useState(0);
  const rounds = useMemo(() => pickPhrases(), [session]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [picked, setPicked] = useState<Chip[]>([]);
  const [shake, setShake] = useState({ id: "", count: 0 });
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const solvedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const phrase = rounds[roundIndex] ?? [];
  const roundKey = `${session}-${roundIndex}`;
  const [pickedKey, setPickedKey] = useState(roundKey);
  const bank = useMemo(() => chipsFor(phrase), [phrase]);
  const spoken = phrase.map((item) => item.text).join(" ");

  if (pickedKey !== roundKey) {
    setPickedKey(roundKey);
    setPicked([]);
    setSolved(false);
  }

  useEffect(() => {
    if (!spoken || finished) return;
    const handle = setTimeout(() => speak(spoken), 280);
    return () => clearTimeout(handle);
  }, [spoken, finished, speak, roundIndex, session]);

  useEffect(() => {
    return () => {
      if (solvedTimer.current) clearTimeout(solvedTimer.current);
    };
  }, [roundIndex, session]);

  const place = (chip: Chip) => {
    if (solved || picked.some((item) => item.id === chip.id)) return;
    if (chip.order !== picked.length) {
      setShake({ id: chip.id, count: shake.count + 1 });
      haptic(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    const next = [...picked, chip];
    setPicked(next);
    speak(chip.text);
    haptic();
    recordWordUse(chip.text, chip.color);

    if (next.length === phrase.length) {
      setSolved(true);
      if (solvedTimer.current) clearTimeout(solvedTimer.current);
      solvedTimer.current = setTimeout(() => speak(spoken), 450);
    }
  };

  const restart = () => {
    setRoundIndex(0);
    setPicked([]);
    setSolved(false);
    setFinished(false);
    setSession((value) => value + 1);
  };

  const nextRound = () => {
    if (roundIndex + 1 >= rounds.length) {
      setFinished(true);
      return;
    }
    setRoundIndex((value) => value + 1);
  };

  return (
    <ActivityChrome title="Monte a Frase">
      {finished ? (
        <ActivityDone
          title="Frases prontas!"
          detail="Você montou todas na ordem"
          againLabel="Montar de novo"
          onAgain={restart}
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 24,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="pb-1 text-center font-quicksand text-lg text-neutral-dark">
            Toque as palavras na ordem
          </Text>
          <Text className="pb-4 text-center font-quicksand text-base text-primary">
            Frase {roundIndex + 1} de {rounds.length}
          </Text>

          <Pressable
            accessibilityLabel={`Ouvir ${spoken}`}
            onPress={() => speak(spoken)}
            className="mb-4 min-h-[72px] flex-row flex-wrap items-center justify-center gap-2 rounded-[22px] bg-[#FAFAFA] px-3 py-3"
          >
            {phrase.map((item, index) => (
              <WordPill
                key={`model-${index}`}
                text={item.text}
                colorName={item.color}
                highContrast={settings.highContrast}
                muted
              />
            ))}
          </Pressable>

          <Text className="pb-2 text-center font-quicksand text-base text-neutral-dark">
            Monte aqui
          </Text>
          <View className="min-h-[64px] flex-row flex-wrap items-center justify-center gap-2">
            {phrase.map((item, index) => {
              const chip = picked[index];
              if (!chip) {
                return (
                  <View
                    key={`slot-${index}`}
                    className="h-12 min-w-[88px] rounded-full border-2 border-dashed border-neutral"
                  />
                );
              }
              return (
                <WordPill
                  key={chip.id}
                  text={chip.text}
                  colorName={chip.color}
                  highContrast={settings.highContrast}
                />
              );
            })}
          </View>

          <View className="mt-8 flex-row flex-wrap items-center justify-center gap-2">
            {bank.map((chip) => {
              const used = picked.some((item) => item.id === chip.id);
              if (used) return <View key={chip.id} className="h-12 min-w-[88px]" />;
              return (
                <ShakeChip key={chip.id} trigger={shake.id === chip.id ? shake.count : 0}>
                  <Pressable accessibilityLabel={chip.text} onPress={() => place(chip)}>
                    <WordPill
                      text={chip.text}
                      colorName={chip.color}
                      highContrast={settings.highContrast}
                    />
                  </Pressable>
                </ShakeChip>
              );
            })}
          </View>

          <View className="mt-auto pt-8">
            {solved ? (
              <Pressable
                accessibilityLabel={roundIndex + 1 >= rounds.length ? "Concluir" : "Próxima frase"}
                onPress={nextRound}
                className="h-14 items-center justify-center rounded-full bg-primary active:opacity-90"
              >
                <Text className="font-quicksand text-xl text-white">
                  {roundIndex + 1 >= rounds.length ? "Concluir" : "Próxima frase"}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityLabel="Ouvir a frase"
                onPress={() => speak(spoken)}
                className="h-14 flex-row items-center justify-center gap-2 rounded-full bg-neutral active:opacity-80"
              >
                <Ionicons name="volume-high" size={24} color={colors.primary} />
                <Text className="font-quicksand text-xl text-primary">Ouvir a frase</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      )}
    </ActivityChrome>
  );
}

function WordPill({
  text,
  colorName,
  highContrast,
  muted,
}: {
  text: string;
  colorName: string;
  highContrast: boolean;
  muted?: boolean;
}) {
  const color = getCategoryColor(colorName);
  return (
    <View
      className="h-12 items-center justify-center rounded-full px-4"
      style={{
        backgroundColor: highContrast ? "#FFFFFF" : getCategoryBgColor(colorName),
        borderWidth: highContrast ? 2 : 0,
        borderColor: color,
        opacity: muted ? 0.55 : 1,
      }}
    >
      <Text className="font-quicksand text-xl" style={{ color }}>
        {text}
      </Text>
    </View>
  );
}

function ShakeChip({ trigger, children }: { trigger: number; children: React.ReactNode }) {
  const x = useSharedValue(0);

  useEffect(() => {
    if (!trigger) return;
    x.value = withSequence(
      withTiming(-8, { duration: 40 }),
      withTiming(8, { duration: 40 }),
      withTiming(-6, { duration: 40 }),
      withTiming(0, { duration: 40 }),
    );
  }, [trigger, x]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

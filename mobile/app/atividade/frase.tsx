import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Image, Pressable, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { Button } from "@/components/Button";
import { PillText } from "@/components/PillText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityChrome, ActivityDone, ActivityPrompt, activityPadding } from "@/components/activities/ActivityChrome";
import { useAppSettings } from "@/context/AppSettingsContext";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { PHRASES_MAIS_USADAS } from "@/constants/phrases";
import { pecImageForTitle } from "@/data/pecImages";
import { sample, shuffle } from "@/data/play";
import { recordWordUse } from "@/services/wordUsage";
import { PhraseItem } from "@/types";

const ROUND_COUNT = 4;
const CHIP_WIDTH = 108;
const CHIP_HEIGHT = 148;

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
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const solvedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
    };
  }, [roundIndex, session]);

  const place = (chip: Chip) => {
    if (solved || picked.some((item) => item.id === chip.id)) return;
    if (chip.order !== picked.length) {
      setShake({ id: chip.id, count: shake.count + 1 });
      setWrongId(chip.id);
      haptic(Haptics.ImpactFeedbackStyle.Light);
      const expected = phrase[picked.length];
      if (expected) speak(expected.text);
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
      wrongTimer.current = setTimeout(() => setWrongId(null), 500);
      return;
    }

    const next = [...picked, chip];
    setPicked(next);
    setWrongId(null);
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
          contentContainerStyle={{ ...activityPadding(insets.bottom), flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <ActivityPrompt
            instruction="Ouça e toque as palavras na ordem"
            progress={`${roundIndex + 1} de ${rounds.length}`}
          />

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
                    className="rounded-2xl border-2 border-dashed border-neutral-dark"
                    style={{ width: CHIP_WIDTH, height: CHIP_HEIGHT }}
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
              if (used) return <View key={chip.id} style={{ width: CHIP_WIDTH, height: CHIP_HEIGHT }} />;
              return (
                <ShakeChip key={chip.id} trigger={shake.id === chip.id ? shake.count : 0}>
                  <Pressable accessibilityLabel={chip.text} onPress={() => place(chip)}>
                    <WordPill
                      text={chip.text}
                      colorName={chip.color}
                      highContrast={settings.highContrast}
                      wrong={wrongId === chip.id}
                    />
                  </Pressable>
                </ShakeChip>
              );
            })}
          </View>

          <View className="mt-auto pt-6">
            {solved ? (
              <Button
                label={roundIndex + 1 >= rounds.length ? "Concluir" : "Próxima frase"}
                labelSize="md"
                onPress={nextRound}
              />
            ) : (
              <Button
                label="Ouvir a frase"
                icon="volume-loud"
                iconSize={24}
                variant="neutral"
                labelSize="md"
                onPress={() => speak(spoken)}
              />
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
  wrong,
}: {
  text: string;
  colorName: string;
  highContrast: boolean;
  wrong?: boolean;
}) {
  const color = getCategoryColor(colorName);
  return (
    <View
      className="items-center rounded-2xl p-2"
      style={{
        width: CHIP_WIDTH,
        height: CHIP_HEIGHT,
        backgroundColor: highContrast ? colors.white : getCategoryBgColor(colorName),
        borderWidth: wrong || highContrast ? 2 : 0,
        borderColor: wrong ? colors.dark : color,
      }}
    >
      <View className="mb-1.5 aspect-square w-full overflow-hidden rounded-xl bg-white">
        <Image source={pecImageForTitle(text)} className="h-full w-full" resizeMode="cover" />
      </View>
      <PillText size={14} numberOfLines={2} style={{ color: colors.dark }}>
        {text}
      </PillText>
    </View>
  );
}

function ShakeChip({ trigger, children }: { trigger: number; children: React.ReactNode }) {
  const x = useSharedValue(0);

  useEffect(() => {
    if (!trigger) return;
    x.value = withSequence(
      withTiming(-10, { duration: 45 }),
      withTiming(10, { duration: 45 }),
      withTiming(-6, { duration: 45 }),
      withTiming(0, { duration: 45 }),
    );
  }, [trigger, x]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

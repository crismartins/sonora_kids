import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Image, Pressable, ScrollView, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { SolarIcon } from "@/components/SolarIcon";
import { Button } from "@/components/Button";
import { PillText } from "@/components/PillText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityChrome, ActivityDone, ActivityPrompt, activityPadding } from "@/components/activities/ActivityChrome";
import { useAppSettings } from "@/context/AppSettingsContext";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { playPecs, sample, shuffle, PlayPec } from "@/data/play";
import { recordWordUse } from "@/services/wordUsage";

const ROUND_COUNT = 5;

type Round = {
  target: PlayPec;
  options: PlayPec[];
};

function makeRounds(): Round[] {
  const pool = playPecs();
  return sample(pool, ROUND_COUNT).map((target) => ({
    target,
    options: shuffle([
      target,
      ...sample(
        pool.filter((pec) => pec.id !== target.id),
        2,
      ),
    ]),
  }));
}

export default function RepitaScreen() {
  const insets = useSafeAreaInsets();
  const { settings, speak, haptic } = useAppSettings();
  const [session, setSession] = useState(0);
  const rounds = useMemo(() => makeRounds(), [session]);
  const [index, setIndex] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const lock = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const round = rounds[index];

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const celebrate = () => {
    if (!settings.haptics || Platform.OS === "web") return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const restart = () => {
    lock.current = false;
    if (timer.current) clearTimeout(timer.current);
    setIndex(0);
    setPickedId(null);
    setWrongId(null);
    setFinished(false);
    setSession((value) => value + 1);
  };

  const choose = (pec: PlayPec) => {
    if (!round || lock.current || pickedId) return;
    if (pec.id !== round.target.id) {
      setWrongId(pec.id);
      haptic(Haptics.ImpactFeedbackStyle.Light);
      timer.current = setTimeout(() => setWrongId(null), 500);
      return;
    }

    lock.current = true;
    setPickedId(pec.id);
    setWrongId(null);
    celebrate();
    speak(pec.title);
    recordWordUse(pec.title, pec.colorName);

    timer.current = setTimeout(() => {
      lock.current = false;
      setPickedId(null);
      if (index + 1 >= rounds.length) {
        setFinished(true);
        return;
      }
      setIndex((value) => value + 1);
    }, 800);
  };

  return (
    <ActivityChrome title="Repita Comigo">
      {finished || !round ? (
        <ActivityDone
          title="Mandou bem!"
          detail="Você praticou todas as palavras"
          againLabel="Praticar de novo"
          onAgain={restart}
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ ...activityPadding(insets.bottom), flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <ActivityPrompt instruction="Ouça e toque na palavra" progress={`${index + 1} de ${rounds.length}`} />

          <View className="gap-3">
            {round.options.map((pec) => (
              <ChoiceCard
                key={pec.id}
                pec={pec}
                highContrast={settings.highContrast}
                selected={pickedId === pec.id}
                wrong={wrongId === pec.id}
                onPress={() => choose(pec)}
              />
            ))}
          </View>

          <View className="mt-auto pt-6">
            <Button
              label="Ouvir"
              icon="volume-loud"
              iconSize={24}
              labelSize="md"
              onPress={() => speak(round.target.title)}
            />
          </View>
        </ScrollView>
      )}
    </ActivityChrome>
  );
}

function ChoiceCard({
  pec,
  highContrast,
  selected,
  wrong,
  onPress,
}: {
  pec: PlayPec;
  highContrast: boolean;
  selected: boolean;
  wrong: boolean;
  onPress: () => void;
}) {
  const color = getCategoryColor(pec.colorName);
  const x = useSharedValue(0);

  useEffect(() => {
    if (!wrong) return;
    x.value = withSequence(
      withTiming(-10, { duration: 45 }),
      withTiming(10, { duration: 45 }),
      withTiming(-6, { duration: 45 }),
      withTiming(0, { duration: 45 }),
    );
  }, [wrong, x]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityLabel={pec.title}
        onPress={onPress}
        className="min-h-[96px] flex-row items-center gap-3 rounded-[22px] py-3 pl-3 pr-12 active:opacity-90"
        style={{
          backgroundColor: highContrast ? colors.white : getCategoryBgColor(pec.colorName),
          borderWidth: selected || wrong || highContrast ? 3 : 0,
          borderColor: wrong ? colors.dark : color,
        }}
      >
        <View className="h-[72px] w-[72px] overflow-hidden rounded-2xl bg-white">
          <Image source={pec.image} className="h-full w-full" resizeMode="cover" />
        </View>
        <View className="flex-1 items-center justify-center">
          <PillText size={28} numberOfLines={2} style={{ color: colors.dark }}>
            {pec.title}
          </PillText>
        </View>
        {selected ? (
          <View className="absolute right-4 h-8 w-8 items-center justify-center rounded-full bg-white">
            <SolarIcon name="check" size={20} color={color} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

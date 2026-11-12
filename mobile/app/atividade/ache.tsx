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
import { useI18n } from "@/i18n";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { playPecs, sample, shuffle, PlayPec } from "@/data/play";
import { pecLabel } from "@/data/pecLabels";
import { ChildSex } from "@/services/profile";
import { recordWordUse } from "@/services/wordUsage";

const ROUND_COUNT = 5;

type Round = {
  target: PlayPec;
  options: PlayPec[];
};

function makeRounds(sex: ChildSex): Round[] {
  const pool = playPecs(sex);
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

export default function AcheScreen() {
  const insets = useSafeAreaInsets();
  const { settings, speak, haptic } = useAppSettings();
  const copy = useI18n();
  const { profile } = useProfile();
  const [session, setSession] = useState(0);
  const rounds = useMemo(() => makeRounds(profile.sex), [session, profile.sex]);
  const [index, setIndex] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [heardKey, setHeardKey] = useState<string | null>(null);
  const lock = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);

  const round = rounds[index];
  const roundKey = `${session}-${index}`;
  const heard = heardKey === roundKey;

  useEffect(() => {
    return () => {
      alive.current = false;
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

  const listen = () => {
    if (!round) return;
    const key = roundKey;
    speak(pecLabel(round.target.title, profile.sex), undefined, () => {
      if (alive.current) setHeardKey(key);
    });
  };

  const choose = (pec: PlayPec) => {
    if (!round || !heard || lock.current || pickedId) return;
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
    speak(pecLabel(pec.title, profile.sex));
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
    <ActivityChrome title={copy.learn.find}>
      {finished || !round ? (
        <ActivityDone
          title={copy.learn.findDone}
          detail={copy.learn.findDoneDetail}
          againLabel={copy.learn.practiceAgain}
          onAgain={restart}
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ ...activityPadding(insets.bottom), flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <ActivityPrompt
            instruction={copy.learn.findDetail}
            steps={{ done: index + (pickedId ? 1 : 0), total: rounds.length }}
          />

          <View className="gap-3">
            {round.options.map((pec) => (
              <ChoiceCard
                key={pec.id}
                pec={pec}
                highContrast={settings.highContrast}
                selected={pickedId === pec.id}
                wrong={wrongId === pec.id}
                disabled={!heard}
                onPress={() => choose(pec)}
              />
            ))}
          </View>

          <View className="mt-auto pt-6">
            <Button
              label={copy.common.listen}
              icon="volume-loud"
              iconSize={24}
              labelSize="md"
              onPress={listen}
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
  disabled,
  onPress,
}: {
  pec: PlayPec;
  highContrast: boolean;
  selected: boolean;
  wrong: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const { profile } = useProfile();
  const label = pecLabel(pec.title, profile.sex);
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
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        className="min-h-[96px] flex-row items-center gap-3 rounded-[22px] py-3 pl-3 pr-12 active:opacity-90"
        style={{
          backgroundColor: highContrast ? colors.white : getCategoryBgColor(pec.colorName),
          borderWidth: selected || wrong || highContrast ? 3 : 0,
          borderColor: wrong ? colors.dark : color,
          opacity: disabled ? 0.45 : 1,
        }}
      >
        <View className="h-[72px] w-[72px] overflow-hidden rounded-2xl bg-white">
          <Image source={pec.image} className="h-full w-full" resizeMode="cover" />
        </View>
        <View className="flex-1 items-center justify-center">
          <PillText size={28} numberOfLines={2} style={{ color: colors.dark }}>
            {label}
          </PillText>
        </View>
        {selected ? (
          <View className="absolute right-4 h-8 w-8 items-center justify-center rounded-full bg-white">
            <SolarIcon name="check-circle" size={20} color={color} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Image, ScrollView, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { SolarIcon } from "@/components/SolarIcon";
import { Button } from "@/components/Button";
import { PillText } from "@/components/PillText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityChrome, ActivityDone, ActivityPrompt, activityPadding } from "@/components/activities/ActivityChrome";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useI18n } from "@/i18n";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { playPecs, sample, PlayPec } from "@/data/play";
import { pecLabel } from "@/data/pecLabels";
import { ChildSex } from "@/services/profile";
import { spokenWordMatches } from "@/services/speechMatch";
import { recordWordUse } from "@/services/wordUsage";

const ROUND_COUNT = 5;

type Phase = "idle" | "listening" | "matched" | "miss" | "denied" | "unavailable";

function makeRounds(sex: ChildSex): PlayPec[] {
  return sample(playPecs(sex), ROUND_COUNT);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stopRecognizer() {
  try {
    ExpoSpeechRecognitionModule.abort();
  } catch {
    // Recognizer was not running.
  }
}

export default function RepitaListening() {
  const insets = useSafeAreaInsets();
  const { settings, speak, stopSpeaking, haptic } = useAppSettings();
  const copy = useI18n();
  const { profile } = useProfile();
  const [session, setSession] = useState(0);
  const rounds = useMemo(() => makeRounds(profile.sex), [session, profile.sex]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [heard, setHeard] = useState("");
  const [missNote, setMissNote] = useState("");
  const [missTick, setMissTick] = useState(0);
  const [finished, setFinished] = useState(false);
  const settled = useRef(false);
  const phaseRef = useRef<Phase>("idle");
  const roundId = useRef(0);
  const listeningRound = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const target = rounds[index];
  const label = target ? pecLabel(target.title, profile.sex) : "";
  const labelRef = useRef(label);
  labelRef.current = label;
  phaseRef.current = phase;

  useEffect(() => {
    return () => {
      stopRecognizer();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    roundId.current += 1;
    settled.current = false;
    setPhase("idle");
    setHeard("");
    setMissNote("");
    stopRecognizer();
  }, [index, session]);

  useEffect(() => {
    if (!label || finished) return;
    const handle = setTimeout(() => {
      if (phaseRef.current === "listening" || phaseRef.current === "matched") return;
      speak(label);
    }, 400);
    return () => clearTimeout(handle);
  }, [label, finished, speak, index, session]);

  const accept = (pec: PlayPec, spoken: string) => {
    if (settled.current) return;
    settled.current = true;
    phaseRef.current = "matched";
    setHeard(spoken);
    setPhase("matched");
    setMissNote("");
    if (settings.haptics && Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    recordWordUse(pec.title, pec.colorName);
    stopRecognizer();

    timer.current = setTimeout(() => {
      setHeard("");
      setPhase("idle");
      if (index + 1 >= rounds.length) {
        setFinished(true);
        return;
      }
      setIndex((value) => value + 1);
    }, 900);
  };

  const reject = (spoken: string, note: string) => {
    if (settled.current) return;
    phaseRef.current = "miss";
    setHeard(spoken);
    setMissNote(note);
    setPhase("miss");
    setMissTick((value) => value + 1);
    haptic(Haptics.ImpactFeedbackStyle.Light);
  };

  useSpeechRecognitionEvent("result", (event) => {
    if (listeningRound.current !== roundId.current) return;
    const transcripts = event.results.map((result) => result.transcript).filter(Boolean);
    const pec = rounds[index];
    const current = labelRef.current;
    if (!pec || !current) return;
    if (transcripts[0]) setHeard(transcripts[0]);
    if (!event.isFinal) return;
    if (spokenWordMatches(current, transcripts)) {
      accept(pec, transcripts[0] ?? current);
      return;
    }
    reject(transcripts[0] ?? "", transcripts[0] ? copy.learn.almost : copy.learn.didntHear);
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (event.error === "aborted" || settled.current || listeningRound.current !== roundId.current) return;
    if (event.error === "not-allowed") {
      phaseRef.current = "denied";
      setPhase("denied");
      return;
    }
    if (event.error === "no-speech" || event.error === "speech-timeout") {
      reject("", copy.learn.didntHear);
      return;
    }
    reject("", copy.learn.miss);
  });

  useSpeechRecognitionEvent("end", () => {
    if (phaseRef.current !== "listening") return;
    phaseRef.current = "idle";
    setPhase("idle");
  });

  const restart = () => {
    settled.current = false;
    if (timer.current) clearTimeout(timer.current);
    stopRecognizer();
    setIndex(0);
    setPhase("idle");
    setHeard("");
    setMissNote("");
    setFinished(false);
    setSession((value) => value + 1);
  };

  const listen = async () => {
    if (settled.current) return;
    if (phaseRef.current === "listening") {
      phaseRef.current = "idle";
      setPhase("idle");
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        // Nothing was capturing yet.
      }
      return;
    }

    phaseRef.current = "listening";
    setPhase("listening");
    setHeard("");
    setMissNote("");
    stopSpeaking();

    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        phaseRef.current = "denied";
        setPhase("denied");
        return;
      }
      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        phaseRef.current = "unavailable";
        setPhase("unavailable");
        return;
      }
      await wait(350);
      if (phaseRef.current !== "listening" || settled.current) return;
      listeningRound.current = roundId.current;
      ExpoSpeechRecognitionModule.start({
        lang: settings.language,
        interimResults: true,
        maxAlternatives: 5,
        continuous: false,
        addsPunctuation: false,
        contextualStrings: [labelRef.current],
        iosTaskHint: "dictation",
        iosVoiceProcessingEnabled: true,
      });
    } catch {
      phaseRef.current = "miss";
      setPhase("miss");
      setMissNote(copy.learn.miss);
    }
  };

  const prompt =
    phase === "listening"
      ? copy.learn.listening
      : phase === "matched"
        ? copy.learn.matched
        : phase === "miss"
          ? missNote
          : copy.learn.speakNow;

  return (
    <ActivityChrome title={copy.learn.repeat}>
      {finished || !target ? (
        <ActivityDone
          title={copy.learn.findDone}
          detail={copy.learn.repeatDoneDetail}
          againLabel={copy.learn.practiceAgain}
          onAgain={restart}
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ ...activityPadding(insets.bottom), flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <ActivityPrompt instruction={copy.learn.repeatPrompt} progress={copy.common.of(index + 1, rounds.length)} />

          <WordCard pec={target} label={label} highContrast={settings.highContrast} phase={phase} missTick={missTick} />

          <View className="items-center px-4 pt-5">
            <PillText size={22} style={{ color: phase === "matched" ? colors.primary : colors.dark }}>
              {prompt}
            </PillText>
            {heard && phase !== "idle" ? (
              <PillText size={18} style={{ color: colors.neutralDark, marginTop: 6 }}>
                {copy.learn.heard(heard)}
              </PillText>
            ) : null}
          </View>

          <View className="mt-auto gap-3 pt-6">
            {phase === "denied" || phase === "unavailable" ? (
              <PillText size={18} style={{ color: colors.dark, marginBottom: 8 }}>
                {phase === "denied"
                  ? copy.learn.micDenied
                  : copy.learn.micUnavailable}
              </PillText>
            ) : null}
            <Button
              label={phase === "listening" ? copy.common.stop : copy.common.speak}
              icon="microphone"
              iconSize={24}
              labelSize="md"
              disabled={phase === "matched"}
              onPress={() => {
                listen().catch(() => {
                  phaseRef.current = "miss";
                  setPhase("miss");
                  setMissNote(copy.learn.miss);
                });
              }}
            />
            <Button
              label={copy.common.listen}
              icon="volume-loud"
              iconSize={24}
              labelSize="md"
              variant="neutral"
              disabled={phase === "listening" || phase === "matched"}
              onPress={() => speak(label)}
            />
          </View>
        </ScrollView>
      )}
    </ActivityChrome>
  );
}

function WordCard({
  pec,
  label,
  highContrast,
  phase,
  missTick,
}: {
  pec: PlayPec;
  label: string;
  highContrast: boolean;
  phase: Phase;
  missTick: number;
}) {
  const color = getCategoryColor(pec.colorName);
  const matched = phase === "matched";
  const wrong = phase === "miss";
  const x = useSharedValue(0);

  useEffect(() => {
    if (!missTick) return;
    x.value = withSequence(
      withTiming(-10, { duration: 45 }),
      withTiming(10, { duration: 45 }),
      withTiming(-6, { duration: 45 }),
      withTiming(0, { duration: 45 }),
    );
  }, [missTick, x]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View
        className="items-center gap-4 rounded-[28px] px-4 py-6"
        style={{
          backgroundColor: highContrast ? colors.white : getCategoryBgColor(pec.colorName),
          borderWidth: matched || wrong || highContrast ? 3 : 0,
          borderColor: wrong ? colors.dark : color,
        }}
      >
        <View className="h-40 w-40 overflow-hidden rounded-[24px] bg-white">
          <Image source={pec.image} className="h-full w-full" resizeMode="cover" />
        </View>
        <PillText size={36} numberOfLines={2} style={{ color: colors.dark }}>
          {label}
        </PillText>
        {matched ? <SolarIcon name="check" size={28} color={color} /> : null}
      </View>
    </Animated.View>
  );
}

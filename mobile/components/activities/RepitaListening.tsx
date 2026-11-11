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
    recordWordUse(pecLabel(pec.title, profile.sex), pec.colorName);
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
    reject(transcripts[0] ?? "", transcripts[0] ? "Quase! Tente de novo" : "Não ouvi. Tente de novo");
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (event.error === "aborted" || settled.current || listeningRound.current !== roundId.current) return;
    if (event.error === "not-allowed") {
      phaseRef.current = "denied";
      setPhase("denied");
      return;
    }
    if (event.error === "no-speech" || event.error === "speech-timeout") {
      reject("", "Não ouvi. Tente de novo");
      return;
    }
    reject("", "Não consegui ouvir. Tente de novo");
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
      setMissNote("Não consegui ouvir. Tente de novo");
    }
  };

  const prompt =
    phase === "listening"
      ? "Estou ouvindo..."
      : phase === "matched"
        ? "Isso!"
        : phase === "miss"
          ? missNote
          : "Toque no microfone e fale";

  return (
    <ActivityChrome title="Repita Comigo">
      {finished || !target ? (
        <ActivityDone
          title="Mandou bem!"
          detail="Você falou todas as palavras"
          againLabel="Praticar de novo"
          onAgain={restart}
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ ...activityPadding(insets.bottom), flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <ActivityPrompt instruction="Ouça e fale a palavra" progress={`${index + 1} de ${rounds.length}`} />

          <WordCard pec={target} label={label} highContrast={settings.highContrast} phase={phase} missTick={missTick} />

          <View className="items-center px-4 pt-5">
            <PillText size={22} style={{ color: phase === "matched" ? colors.primary : colors.dark }}>
              {prompt}
            </PillText>
            {heard && phase !== "idle" ? (
              <PillText size={18} style={{ color: colors.neutralDark, marginTop: 6 }}>
                {`Ouvi: ${heard}`}
              </PillText>
            ) : null}
          </View>

          <View className="mt-auto gap-3 pt-6">
            {phase === "denied" || phase === "unavailable" ? (
              <PillText size={18} style={{ color: colors.dark, marginBottom: 8 }}>
                {phase === "denied"
                  ? "Libere o microfone e o reconhecimento de voz nos Ajustes do celular."
                  : "Este aparelho não consegue reconhecer a voz."}
              </PillText>
            ) : null}
            <Button
              label={phase === "listening" ? "Parar" : "Falar"}
              icon="microphone"
              iconSize={24}
              labelSize="md"
              disabled={phase === "matched"}
              onPress={() => {
                listen().catch(() => {
                  phaseRef.current = "miss";
                  setPhase("miss");
                  setMissNote("Não consegui ouvir. Tente de novo");
                });
              }}
            />
            <Button
              label="Ouvir"
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

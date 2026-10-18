import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  BackHandler,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryIcon } from "@/components/CategoryIcon";
import { SolarIcon } from "@/components/SolarIcon";
import { colors } from "@/constants/colors";
import { FONT_FAMILY } from "@/constants/typography";
import { useAppSettings } from "@/context/AppSettingsContext";
import { MOCK_CATEGORIES } from "@/data/categories";
import { markOnboardingSeen } from "@/services/onboarding";

const AVATAR = require("../assets/images/avatar_default_v1.png");
const AVATAR_2 = require("../assets/images/avatar_default_v2.png");

const BODY_COLOR = "#4A5D73";
const DOT_IDLE = "#D5E2EE";
const SPEAKER_BG = colors.primaryWash;

const LIBRARY_SIZE =
  Math.floor(
    MOCK_CATEGORIES.reduce((total, category) => total + category.pECS.nodes.length, 0) / 10,
  ) * 10;

const SLIDES = [
  {
    key: "palavras",
    title: "Use suas palavras",
    body: `Com uma biblioteca com mais de ${LIBRARY_SIZE} palavras separadas em diferentes categorias.`,
  },
  {
    key: "frases",
    title: "Monte frases",
    body: "Frases prontas para situações do dia-a-dia, além de poder montar as suas, usando a nossa biblioteca de palavras.",
  },
  {
    key: "comunicar",
    title: "Aprenda a se comunicar",
    body: "Aprenda brincando com nossos mini-games.",
  },
  {
    key: "rotina",
    title: "Sua Rotina",
    body: "Ajude o papai e a mamãe a lembrar da sua rotina diária.",
  },
] as const;

type SlideKey = (typeof SLIDES)[number]["key"];

function CakeArt({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "flex-end" }}>
      <View
        style={{
          width: Math.max(3, size * 0.1),
          height: size * 0.22,
          borderRadius: 2,
          backgroundColor: "#FFD54F",
        }}
      />
      <View
        style={{
          width: size * 0.72,
          height: size * 0.2,
          marginTop: -1,
          borderRadius: size,
          backgroundColor: "#F48FB1",
        }}
      />
      <View
        style={{
          width: size * 0.88,
          height: size * 0.36,
          borderBottomLeftRadius: size * 0.16,
          borderBottomRightRadius: size * 0.16,
          backgroundColor: "#C4A484",
        }}
      />
    </View>
  );
}

const WORD_ICON_ROWS = [
  ["boas-maneiras", "sentimentos", "animais", "objetos-e-brinquedos", "pessoas"],
  ["acoes-e-atividades", "perguntas-e-respostas", "lugares", "necessidades", "transporte"],
  ["datas-e-eventos", "formas-e-cores", "dia-a-dia", "roupas-e-acessorios", "comida-e-bebida"],
] as const;

function WordsArt({ width }: { width: number }) {
  const artWidth = Math.min(width - 48, 332);
  const gap = 18;
  const icon = Math.floor((artWidth - gap * 4) / 5);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: icon * 5 + gap * 4, gap }}
    >
      {WORD_ICON_ROWS.map((row) => (
        <View key={row[0]} style={{ flexDirection: "row", gap }}>
          {row.map((slug) => (
            <CategoryIcon key={slug} slug={slug} size={icon} />
          ))}
        </View>
      ))}
    </View>
  );
}

function TokenChip({
  label,
  backgroundColor,
  leading,
}: {
  label: string;
  backgroundColor: string;
  leading: ReactNode;
}) {
  return (
    <View
      style={{
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderRadius: 20,
        paddingLeft: 6,
        paddingRight: 10,
        backgroundColor,
      }}
    >
      {leading}
      <Text style={{ fontFamily: FONT_FAMILY, fontSize: 16, color: colors.dark }}>{label}</Text>
      <SolarIcon name="close" size={14} color="#8AA0B4" />
    </View>
  );
}

function PhraseArt({ width }: { width: number }) {
  const cardWidth = Math.min(340, width - 48);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: cardWidth, alignItems: "center", gap: 14 }}
    >
      <View style={{ width: "100%", height: 76, flexDirection: "row", overflow: "hidden", borderRadius: 18 }}>
        <View
          style={{
            flex: 1.35,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 12,
            backgroundColor: "#FDE8F4",
          }}
        >
          <Image source={AVATAR} style={{ width: 40, height: 40, borderRadius: 20 }} />
          <Text style={{ fontFamily: FONT_FAMILY, fontSize: 16, color: colors.dark }}>Eu quero</Text>
        </View>
        <View
          style={{
            width: 78,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#E7F8EE",
          }}
        >
          <CakeArt size={34} />
          <Text style={{ fontFamily: FONT_FAMILY, fontSize: 13, color: colors.dark, marginTop: 1 }}>Bolo</Text>
        </View>
        <View
          style={{
            width: 54,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: SPEAKER_BG,
          }}
        >
          <SolarIcon name="volume-loud" size={22} color={colors.primary} />
        </View>
      </View>

      <View style={{ alignItems: "center", gap: 8 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TokenChip
            label="Eu"
            backgroundColor="#EDE4FF"
            leading={<Image source={AVATAR_2} style={{ width: 26, height: 26, borderRadius: 13 }} />}
          />
          <TokenChip
            label="quero"
            backgroundColor="#FDE8F4"
            leading={<Image source={AVATAR} style={{ width: 26, height: 26, borderRadius: 13 }} />}
          />
        </View>
        <TokenChip
          label="Bolo"
          backgroundColor="#E7F8EE"
          leading={<CakeArt size={24} />}
        />
      </View>
    </View>
  );
}

function LearnArt() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.32,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
    >
      <SolarIcon name="microphone" size={44} color="#FFFFFF" />
    </View>
  );
}

function RoutineCard({
  title,
  source,
  width,
}: {
  title: string;
  source: ImageSourcePropType;
  width: number;
}) {
  return (
    <View
      style={{
        width,
        alignItems: "center",
        borderRadius: 18,
        backgroundColor: "#D8F8E4",
        padding: 10,
      }}
    >
      <Image
        source={source}
        style={{ width: "100%", aspectRatio: 1, borderRadius: 12 }}
        resizeMode="cover"
      />
      <Text style={{ marginTop: 8, fontFamily: FONT_FAMILY, fontSize: 16, color: colors.dark }}>{title}</Text>
    </View>
  );
}

function RoutineArt({ width }: { width: number }) {
  const gap = 12;
  const peek = 28;
  const cardWidth = Math.min(148, Math.round((width - gap * 2 - peek - 24) / 2));
  const rowInset = Math.max(12, width - cardWidth * 2 - gap * 2 - peek);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width, paddingLeft: rowInset }}
    >
      <View style={{ width: cardWidth * 2 + gap, marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-end", gap: 8 }}>
          <View
            style={{
              borderRadius: 999,
              backgroundColor: colors.primary,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontFamily: FONT_FAMILY, fontSize: 13, color: "#FFFFFF" }}>8:00</Text>
          </View>
          <Text style={{ fontFamily: FONT_FAMILY, fontSize: 13, color: colors.primary, letterSpacing: 0.4 }}>
            ROTINA MANHÃ
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap }}>
        <RoutineCard title="Oi" source={AVATAR} width={cardWidth} />
        <RoutineCard title="Tchau" source={AVATAR_2} width={cardWidth} />
        <RoutineCard title="Bom dia" source={AVATAR} width={cardWidth} />
      </View>
    </View>
  );
}

function SlideArt({ slideKey, width }: { slideKey: SlideKey; width: number }) {
  switch (slideKey) {
    case "palavras":
      return <WordsArt width={width} />;
    case "frases":
      return <PhraseArt width={width} />;
    case "comunicar":
      return <LearnArt />;
    case "rotina":
      return <RoutineArt width={width} />;
  }
}

function Dot({ active }: { active: boolean }) {
  return (
    <View
      style={{
        width: active ? 22 : 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: active ? colors.primary : DOT_IDLE,
      }}
    />
  );
}

export function OnboardingSlider({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { speak, stopSpeaking, haptic } = useAppSettings();
  const pagerRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);
  const closing = useRef(false);
  const heardSlide = useRef(0);
  const [index, setIndex] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  indexRef.current = index;

  const finish = useCallback(async () => {
    if (closing.current) return;
    closing.current = true;
    stopSpeaking();
    haptic(Haptics.ImpactFeedbackStyle.Light);
    try {
      await markOnboardingSeen();
    } catch {
      // A failed write shows the intro again on the next launch.
    }
    onDone();
  }, [haptic, onDone, stopSpeaking]);

  const scrollTo = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, next));
    pagerRef.current?.scrollTo({ x: clamped * width, animated: true });
    setIndex(clamped);
  }, [width]);

  useEffect(() => {
    pagerRef.current?.scrollTo({ x: indexRef.current * width, animated: false });
  }, [width]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (indexRef.current > 0) {
        scrollTo(indexRef.current - 1);
        return true;
      }
      finish();
      return true;
    });
    return () => subscription.remove();
  }, [finish, scrollTo]);

  useEffect(() => {
    const previous = heardSlide.current;
    heardSlide.current = index;
    if (previous !== index) stopSpeaking();
  }, [index, stopSpeaking]);

  const syncIndex = useCallback((offsetX: number) => {
    if (!width) return;
    const next = Math.max(0, Math.min(SLIDES.length - 1, Math.round(offsetX / width)));
    setIndex((current) => (current === next ? current : next));
  }, [width]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      syncIndex(event.nativeEvent.contentOffset.x);
    },
    [syncIndex],
  );

  const speakCurrent = useCallback(() => {
    const slide = SLIDES[index];
    if (!slide) return;
    haptic(Haptics.ImpactFeedbackStyle.Light);
    speak(`${slide.title}. ${slide.body}`);
  }, [haptic, index, speak]);

  return (
    <Animated.View
      accessibilityViewIsModal
      exiting={FadeOut.duration(220)}
      style={[StyleSheet.absoluteFill, { zIndex: 40, backgroundColor: "#FFFFFF" }]}
    >
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 20 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pular introdução"
          onPress={finish}
          hitSlop={8}
          style={({ pressed }) => ({
            alignSelf: "flex-start",
            minHeight: 44,
            justifyContent: "center",
            paddingRight: 12,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text style={{ fontFamily: FONT_FAMILY, fontSize: 17, color: colors.primary }}>Pular</Text>
        </Pressable>
      </View>

      <View
        style={{ flex: 1 }}
        onLayout={(event) => {
          const next = Math.round(event.nativeEvent.layout.height);
          setPageHeight((current) => (current === next ? current : next));
        }}
      >
        {pageHeight > 0 ? (
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            bounces
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            disableIntervalMomentum
            snapToInterval={width}
            snapToAlignment="start"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onMomentumScrollEnd={handleScroll}
            style={{ height: pageHeight }}
          >
            {SLIDES.map((slide) => (
              <View
                key={slide.key}
                accessibilityLabel={`${slide.title}. ${slide.body}`}
                style={{ width, height: pageHeight, overflow: "hidden" }}
              >
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingBottom: 28,
                  }}
                >
                  <SlideArt slideKey={slide.key} width={width} />
                </View>
                <View style={{ minHeight: 176, paddingHorizontal: 32, paddingBottom: 12 }}>
                  <Text
                    style={{
                      textAlign: "center",
                      fontFamily: FONT_FAMILY,
                      fontSize: 24,
                      color: colors.primary,
                    }}
                  >
                    {slide.title}
                  </Text>
                  <Text
                    style={{
                      marginTop: 10,
                      textAlign: "center",
                      fontFamily: FONT_FAMILY,
                      fontSize: 16,
                      lineHeight: 23,
                      color: BODY_COLOR,
                    }}
                  >
                    {slide.body}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: Math.max(insets.bottom, 16) }}>
        <View style={{ height: 56, justifyContent: "center" }}>
          <View
            style={[
              StyleSheet.absoluteFill,
              { alignItems: "center", justifyContent: "center", pointerEvents: "box-none" },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {SLIDES.map((slide, slideIndex) => (
                <Pressable
                  key={slide.key}
                  accessibilityRole="button"
                  accessibilityLabel={`Etapa ${slideIndex + 1} de ${SLIDES.length}`}
                  accessibilityState={{ selected: slideIndex === index }}
                  hitSlop={10}
                  onPress={() => scrollTo(slideIndex)}
                >
                  <Dot active={slideIndex === index} />
                </Pressable>
              ))}
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ouvir esta etapa"
            onPress={speakCurrent}
            style={({ pressed }) => ({
              zIndex: 1,
              alignSelf: "flex-end",
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: SPEAKER_BG,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <SolarIcon name="volume-loud" size={26} color={colors.primary} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

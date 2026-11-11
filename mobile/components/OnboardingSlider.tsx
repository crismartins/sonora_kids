import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BackHandler,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryPill } from "@/components/CategoryPill";
import { FilterChip } from "@/components/FilterChip";
import { PhraseCard } from "@/components/PhraseCard";
import { SolarIcon, type SolarIconName } from "@/components/SolarIcon";
import { colors, getCategoryBgColor, getCategoryColor } from "@/constants/colors";
import { FONT_FAMILY } from "@/constants/typography";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useProfile } from "@/context/ProfileContext";
import { MOCK_CATEGORIES } from "@/data/categories";
import { pecLabel } from "@/data/pecLabels";
import { imageFromPec, pecImageForTitle } from "@/data/pecImages";
import { usePecImageOverrides } from "@/hooks/usePecImageOverrides";
import { markOnboardingSeen } from "@/services/onboarding";
import { PecItem, PhraseItem } from "@/types";
import { PillText } from "@/components/PillText";
import { IconButton } from "./Button";

const BODY_COLOR = "#4A5D73";
const DOT_IDLE = "#D5E2EE";

const LIBRARY_SIZE =
  Math.floor(MOCK_CATEGORIES.reduce((total, category) => total + category.pECS.nodes.length, 0) / 10) * 10;

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
    body: "Aprenda brincando com nossas atividades.",
  },
  {
    key: "rotina",
    title: "Sua Rotina",
    body: "Ajude o papai e a mamãe a lembrar da sua rotina diária.",
  },
] as const;

type SlideKey = (typeof SLIDES)[number]["key"];

const WORDS_IMAGE = require("../assets/images/onboarding-palavras.png");
const WORDS_ASPECT = 914 / 901;

function WordsArt({ width, height }: { width: number; height: number }) {
  const maxWidth = Math.max(1, width - 40);
  const maxHeight = Math.max(1, height - 8);
  let drawWidth = maxWidth;
  let drawHeight = drawWidth / WORDS_ASPECT;
  if (drawHeight > maxHeight) {
    drawHeight = maxHeight;
    drawWidth = drawHeight * WORDS_ASPECT;
  }

  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Image source={WORDS_IMAGE} style={{ width: drawWidth, height: drawHeight }} resizeMode="contain" />
    </View>
  );
}

const PHRASE_PREVIEW: PhraseItem[] = [
  { text: "Eu", color: "teal" },
  { text: "Quero", color: "amber" },
  { text: "Brincar", color: "purple" },
];

const PHRASE_CARD_TITLES = ["Brincar", "Comer", "Beber"];
const PHRASE_PILL_SLUGS = ["acoes-e-atividades", "sentimentos", "comida-e-bebida", "necessidades"];

// Wide enough for the puzzle row, the remove buttons, and the category pill to sit
// fully inside the frame. PhraseArt scales this down to the slide.
const PHRASE_DESIGN_WIDTH = 540;

function categoryBySlug(slug: string) {
  return MOCK_CATEGORIES.find((category) => category.slug === slug);
}

function pecByTitle(title: string) {
  for (const category of MOCK_CATEGORIES) {
    const found = category.pECS.nodes.find((node) => node.title === title);
    if (found) return found;
  }
  return undefined;
}

function PreviewPecCard({ item, backgroundColor }: { item: PecItem; backgroundColor: string }) {
  const { profile } = useProfile();
  const label = pecLabel(item.title, profile.sex);

  return (
    <View
      style={{
        flex: 1,
        borderRadius: 22,
        backgroundColor,
        padding: 12,
      }}
    >
      <View
        style={{
          width: "100%",
          aspectRatio: 1,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: colors.white,
        }}
      >
        <Image source={imageFromPec(item, profile.sex)} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
      </View>
      <Text
        numberOfLines={1}
        style={{
          marginTop: 10,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontSize: 22,
          color: colors.dark,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function PhrasePreview({ width }: { width: number }) {
  const { profile } = useProfile();
  const imageVersion = usePecImageOverrides();
  const images = useMemo(() => {
    const map = new Map<string, ImageSourcePropType>();
    for (const item of PHRASE_PREVIEW) {
      map.set(item.text.toLocaleLowerCase("pt-BR"), pecImageForTitle(item.text, profile.sex));
    }
    return map;
  }, [imageVersion, profile.sex]);

  const cards = PHRASE_CARD_TITLES.map(pecByTitle).filter((item): item is PecItem => item != null);
  const pills = PHRASE_PILL_SLUGS.map(categoryBySlug).filter((category) => category != null);
  const cardColor = getCategoryBgColor("purple");

  return (
    <View style={{ width }}>
      <PhraseCard phrase={PHRASE_PREVIEW} images={images} onRemoveItem={() => undefined} />
      <View style={{ height: 1, marginHorizontal: 8, marginTop: 8, backgroundColor: colors.line }} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 }}>
        {pills.map((category, index) => (
          <CategoryPill
            key={category.slug}
            slug={category.slug}
            name={category.name}
            colorName={category.categoriasDePec.configuracoesCategorias.cor}
            selected={index === 0}
            highContrast={false}
            size="lg"
            onPress={() => undefined}
          />
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
        {cards.map((item) => (
          <PreviewPecCard key={item.id} item={item} backgroundColor={cardColor} />
        ))}
      </View>
    </View>
  );
}

function FittedPreview({
  width,
  height,
  designWidth,
  children,
}: {
  width: number;
  height: number;
  designWidth: number;
  children: ReactNode;
}) {
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const maxWidth = Math.max(1, width - 8);
  const maxHeight = Math.max(1, height - 4);
  const fitted = natural.width > 0 && natural.height > 0;
  const scale = fitted ? Math.min(maxWidth / natural.width, maxHeight / natural.height, 1) : 1;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: fitted ? natural.width * scale : designWidth,
        height: fitted ? natural.height * scale : undefined,
        opacity: fitted ? 1 : 0,
      }}
    >
      <View
        pointerEvents="none"
        onLayout={(event) => {
          const nextWidth = Math.round(event.nativeEvent.layout.width);
          const nextHeight = Math.round(event.nativeEvent.layout.height);
          setNatural((current) =>
            current.width === nextWidth && current.height === nextHeight
              ? current
              : { width: nextWidth, height: nextHeight },
          );
        }}
        style={
          fitted
            ? {
                position: "absolute",
                width: natural.width,
                left: (natural.width * (scale - 1)) / 2,
                top: (natural.height * (scale - 1)) / 2,
                transform: [{ scale }],
              }
            : undefined
        }
      >
        {children}
      </View>
    </View>
  );
}

function PhraseArt({ width, height }: { width: number; height: number }) {
  return (
    <FittedPreview width={width} height={height} designWidth={PHRASE_DESIGN_WIDTH}>
      <PhrasePreview width={PHRASE_DESIGN_WIDTH} />
    </FittedPreview>
  );
}

const ACTIVITY_DESIGN_WIDTH = 520;

const ACTIVITY_ROWS: { icon: SolarIconName; title: string; description: string; tag: string; color: string; background: string }[] = [
  {
    icon: "gamepad",
    title: "Memória com PECS",
    description: "Encontre os pares de palavras",
    tag: "Jogo",
    color: colors.primary,
    background: colors.primaryWash,
  },
  {
    icon: "volume-loud",
    title: "Ache a Palavra",
    description: "Ouça e toque na palavra",
    tag: "Ouvir",
    color: getCategoryColor("greenAccent"),
    background: getCategoryBgColor("greenAccent"),
  },
  {
    icon: "microphone",
    title: "Repita Comigo",
    description: "Ouça e fale a palavra",
    tag: "Fala",
    color: getCategoryColor("pink"),
    background: getCategoryBgColor("pink"),
  },
  {
    icon: "text-field",
    title: "Monte a Frase",
    description: "Ouça e toque as palavras na ordem",
    tag: "Frase",
    color: getCategoryColor("purple"),
    background: getCategoryBgColor("purple"),
  },
  {
    icon: "book",
    title: "História do Dia",
    description: "Ouça o conto e passe a página",
    tag: "Leitura",
    color: getCategoryColor("orange"),
    background: getCategoryBgColor("orange"),
  },
];

function ActivitiesPreview({ width }: { width: number }) {
  return (
    <View
      style={{
        width,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.canvas,
        paddingHorizontal: 18,
        paddingVertical: 8,
      }}
    >
      {ACTIVITY_ROWS.map((activity, index) => (
        <View key={activity.title}>
          {index > 0 ? <View style={{ height: 1, backgroundColor: colors.line }} /> : null}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: activity.background,
              }}
            >
              <SolarIcon name={activity.icon} size={30} color={activity.color} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: FONT_FAMILY, fontSize: 24, color: colors.dark }}>{activity.title}</Text>
              <Text style={{ fontFamily: FONT_FAMILY, fontSize: 18, lineHeight: 22, color: colors.neutralDark }}>
                {activity.description}
              </Text>
            </View>
            <View
              style={{
                height: 32,
                paddingHorizontal: 12,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: activity.background,
              }}
            >
              <PillText size={16} style={{ color: activity.color }}>
                {activity.tag}
              </PillText>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function ActivitiesArt({ width, height }: { width: number; height: number }) {
  return (
    <FittedPreview width={width} height={height} designWidth={ACTIVITY_DESIGN_WIDTH}>
      <ActivitiesPreview width={ACTIVITY_DESIGN_WIDTH} />
    </FittedPreview>
  );
}

const ROUTINE_DAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const ROUTINE_PERIODS: { label: string; icon: SolarIconName }[] = [
  { label: "Manhã", icon: "sun" },
  { label: "Tarde", icon: "cloud-sun" },
  { label: "Noite", icon: "moon" },
];
const ROUTINE_CARD_TITLES = ["Acordar", "Escovar os dentes"];
const ROUTINE_DESIGN_WIDTH = 600;

function RoutinePreviewCard({ item, backgroundColor }: { item: PecItem; backgroundColor: string }) {
  const { profile } = useProfile();
  const label = pecLabel(item.title, profile.sex);

  return (
    <View
      style={{
        flex: 1,
        borderRadius: 22,
        backgroundColor,
        padding: 12,
      }}
    >
      <View
        style={{
          width: "100%",
          aspectRatio: 1,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: colors.white,
        }}
      >
        <Image source={imageFromPec(item, profile.sex)} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
      </View>
      <Text
        numberOfLines={2}
        style={{
          marginTop: 12,
          minHeight: 56,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontSize: 26,
          lineHeight: 28,
          color: colors.dark,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function RoutinePreview({ width }: { width: number }) {
  usePecImageOverrides();
  const cards = ROUTINE_CARD_TITLES.map(pecByTitle).filter((item): item is PecItem => item != null);
  const cardColor = getCategoryBgColor("deepPurple");

  return (
    <View style={{ width }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {ROUTINE_DAYS.map((day, index) => (
          <FilterChip key={day} label={day} selected={index === 0} onPress={() => undefined} />
        ))}
      </View>
      <View style={{ flexDirection: "row", marginTop: 18 }}>
        {ROUTINE_PERIODS.map((period, index) => {
          const active = index === 0;
          const tint = active ? colors.primary : colors.neutralDark;
          return (
            <View
              key={period.label}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                borderRadius: 999,
                paddingVertical: 12,
                backgroundColor: active ? colors.primarySoft : "transparent",
              }}
            >
              <SolarIcon name={period.icon} size={28} color={tint} />
              <Text style={{ fontFamily: FONT_FAMILY, fontSize: 18, color: tint }}>{period.label}</Text>
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: "row", alignItems: "stretch", gap: 12, marginTop: 18 }}>
        {cards.map((item) => (
          <RoutinePreviewCard key={item.id} item={item} backgroundColor={cardColor} />
        ))}
      </View>
    </View>
  );
}

function RoutineArt({ width, height }: { width: number; height: number }) {
  return (
    <FittedPreview width={width} height={height} designWidth={ROUTINE_DESIGN_WIDTH}>
      <RoutinePreview width={ROUTINE_DESIGN_WIDTH} />
    </FittedPreview>
  );
}

function SlideArt({ slideKey, width, height }: { slideKey: SlideKey; width: number; height: number }) {
  switch (slideKey) {
    case "palavras":
      return <WordsArt width={width} height={height} />;
    case "frases":
      return <PhraseArt width={width} height={height} />;
    case "comunicar":
      return <ActivitiesArt width={width} height={height} />;
    case "rotina":
      return <RoutineArt width={width} height={height} />;
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
  const pagerRef = useRef<ScrollViewInstance>(null);
  const indexRef = useRef(0);
  const closing = useRef(false);
  const heardSlide = useRef(0);
  const [index, setIndex] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [artHeight, setArtHeight] = useState(0);
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

  const scrollTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(SLIDES.length - 1, next));
      pagerRef.current?.scrollTo({ x: clamped * width, animated: true });
      setIndex(clamped);
    },
    [width],
  );

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

  const syncIndex = useCallback(
    (offsetX: number) => {
      if (!width) return;
      const next = Math.max(0, Math.min(SLIDES.length - 1, Math.round(offsetX / width)));
      setIndex((current) => (current === next ? current : next));
    },
    [width],
  );

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
          <Text style={{ fontFamily: FONT_FAMILY, fontSize: 18, color: colors.primary }}>Pular</Text>
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
                  }}
                  onLayout={(event) => {
                    const next = Math.round(event.nativeEvent.layout.height);
                    setArtHeight((current) => (current === next ? current : next));
                  }}
                >
                  {artHeight > 0 ? (
                    <View style={{ paddingBottom: 28, alignItems: "center" }}>
                      <SlideArt slideKey={slide.key} width={width} height={Math.max(0, artHeight - 28)} />
                    </View>
                  ) : null}
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
                      lineHeight: 24,
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
        <View style={{ height: 56, justifyContent: "center", alignItems: "flex-end" }}>
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
          <IconButton
            icon="volume-loud"
            size="lg"
            variant="neutral"
            accessibilityLabel="Ouvir esta etapa"
            onPress={speakCurrent}
          />
        </View>
      </View>
    </Animated.View>
  );
}

import React, { useCallback, useRef, useState } from "react";
import { View, Pressable, Image, ImageSourcePropType, ScrollView, useWindowDimensions, Platform } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { SolarIcon } from "@/components/SolarIcon";
import { PhraseItem } from "@/types";
import { colors, getCategoryBgColor } from "@/constants/colors";
import { PillText } from "@/components/PillText";
import { useAppSettings } from "@/context/AppSettingsContext";
import { recordWordUse } from "@/services/wordUsage";

const FALLBACK_IMAGE = require("../assets/images/avatar_default_v1.png");

const TAB = 12;
const OUTER_RADIUS = 20;
const JOINT_RADIUS = 8;
const SPEAKER_BODY = 72;
const MIN_BODY = 80;
const MAX_BODY = 140;
const IMAGE_SIZE = 32;
const PIECE_HEIGHT = 88;

interface PhraseCardProps {
  phrase: PhraseItem[];
  images?: Map<string, ImageSourcePropType>;
  onManage?: () => void;
}

function puzzlePath(bodyWidth: number, height: number, leftSocket: boolean, rightTab: boolean) {
  const leftR = Math.min(leftSocket ? JOINT_RADIUS : OUTER_RADIUS, bodyWidth / 3);
  const rightR = Math.min(rightTab ? JOINT_RADIUS : OUTER_RADIUS, bodyWidth / 3);
  const right = bodyWidth;
  const cy = height / 2;
  const topTab = cy - TAB;
  const bottomTab = cy + TAB;

  let d = `M ${leftR} 0 H ${right - rightR}`;
  d += ` A ${rightR} ${rightR} 0 0 1 ${right} ${rightR}`;
  if (rightTab) {
    d += ` V ${topTab} A ${TAB} ${TAB} 0 0 1 ${right} ${bottomTab} V ${height - rightR}`;
  } else {
    d += ` V ${height - rightR}`;
  }
  d += ` A ${rightR} ${rightR} 0 0 1 ${right - rightR} ${height} H ${leftR}`;
  d += ` A ${leftR} ${leftR} 0 0 1 0 ${height - leftR}`;
  if (leftSocket) {
    d += ` V ${bottomTab} A ${TAB} ${TAB} 0 0 0 0 ${topTab} V ${leftR}`;
  } else {
    d += ` V ${leftR}`;
  }
  d += ` A ${leftR} ${leftR} 0 0 1 ${leftR} 0 Z`;
  return d;
}

function PuzzlePiece({
  bodyWidth,
  height,
  leftSocket,
  rightTab,
  fill,
  stroke,
  children,
}: {
  bodyWidth: number;
  height: number;
  leftSocket: boolean;
  rightTab: boolean;
  fill: string;
  stroke: string;
  children?: React.ReactNode;
}) {
  const width = bodyWidth + (rightTab ? TAB : 0);
  return (
    <View style={{ width, height, marginLeft: leftSocket ? -TAB : 0 }}>
      <Svg pointerEvents="none" width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
        <Path
          d={puzzlePath(bodyWidth, height, leftSocket, rightTab)}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </Svg>
      <View
        style={{
          width: bodyWidth,
          height,
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: leftSocket ? TAB + 6 : 8,
          paddingRight: rightTab ? 8 : 6,
          paddingVertical: 8,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function pieceImage(images: Map<string, ImageSourcePropType> | undefined, text: string) {
  const source = images?.get(text.trim().toLocaleLowerCase("pt-BR"));
  return source ?? FALLBACK_IMAGE;
}

export function PhraseCard({ phrase, images, onManage }: PhraseCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const { settings, speak, stopSpeaking, haptic } = useAppSettings();
  const scale = useSharedValue(1);
  const longPressed = useRef(false);
  const [rowWidth, setRowWidth] = useState(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    scale.value = withSequence(withTiming(0.98, { duration: 60 }), withSpring(1, { damping: 12 }));
    haptic();
    speak(phrase.map((item) => item.text).join(" "));
    phrase.forEach((item) => recordWordUse(item.text, item.color));
  }, [haptic, phrase, scale, speak]);

  const handleLongPress = useCallback(() => {
    longPressed.current = true;
    stopSpeaking();
    if (!onManage) return;
    haptic();
    onManage();
  }, [haptic, onManage, stopSpeaking]);

  const available = rowWidth || Math.max(0, windowWidth - 32);
  const count = Math.max(phrase.length, 1);
  const natural = (available - SPEAKER_BODY) / count;
  const needsScroll = natural < MIN_BODY;
  const bodyWidth = needsScroll ? MIN_BODY : Math.min(MAX_BODY, natural);
  const contentWidth = count * bodyWidth + SPEAKER_BODY;
  const stroke = settings.highContrast ? colors.dark : "rgba(0, 29, 74, 0.12)";

  const pieces = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={phrase.map((item) => item.text).join(" ")}
      accessibilityHint={onManage ? "Toque e segure para editar ou apagar" : undefined}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={450}
      style={{ flexDirection: "row", width: contentWidth, alignItems: "center" }}
    >
      {phrase.map((item, index) => {
        const longLabel = item.text.length > 16;
        const textSize = longLabel ? 14 : settings.largeText ? 18 : 16;
        return (
          <PuzzlePiece
            key={`${item.text}-${index}`}
            bodyWidth={bodyWidth}
            height={PIECE_HEIGHT}
            leftSocket={index > 0}
            rightTab
            fill={settings.highContrast ? colors.white : getCategoryBgColor(item.color)}
            stroke={stroke}
          >
            <View
              style={{
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
                borderRadius: IMAGE_SIZE / 2,
                overflow: "hidden",
                backgroundColor: colors.white,
              }}
            >
              <Image
                source={pieceImage(images, item.text)}
                style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
                resizeMode="cover"
              />
            </View>
            <PillText
              size={textSize}
              numberOfLines={2}
              style={{ width: "100%", color: colors.dark, marginTop: 4, lineHeight: textSize + 4 }}
            >
              {item.text}
            </PillText>
          </PuzzlePiece>
        );
      })}
      <PuzzlePiece
        bodyWidth={SPEAKER_BODY}
        height={PIECE_HEIGHT}
        leftSocket
        rightTab={false}
        fill={colors.primaryWash}
        stroke={stroke}
      >
        <SolarIcon name="volume-loud" size={28} color={colors.primary} />
      </PuzzlePiece>
    </Pressable>
  );

  return (
    <Animated.View
      onLayout={(event) => {
        const next = Math.round(event.nativeEvent.layout.width);
        setRowWidth((current) => (current === next ? current : next));
      }}
      style={[
        {
          marginHorizontal: 16,
          marginVertical: 5,
          ...Platform.select({
            ios: {
              shadowColor: colors.dark,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
            default: {},
          }),
        },
        animatedStyle,
      ]}
    >
      {needsScroll ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          {pieces}
        </ScrollView>
      ) : (
        pieces
      )}
    </Animated.View>
  );
}

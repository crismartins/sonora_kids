import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, Image, ImageSourcePropType, useWindowDimensions, Platform } from "react-native";
import Svg, { Path } from "react-native-svg";
import { GestureDetector, ScrollView as GestureScrollView, usePanGesture, type NativeGesture } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { IconButton } from "@/components/Button";
import { SolarIcon } from "@/components/SolarIcon";
import { PhraseItem } from "@/types";
import { colors, getCategoryBgColor } from "@/constants/colors";
import { PillText } from "@/components/PillText";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useProfile } from "@/context/ProfileContext";
import { useI18n } from "@/i18n";
import { PEC_FALLBACK_IMAGE } from "@/data/pecFallback";
import { pecBaseTitle, pecLabel, pecPhrase } from "@/data/pecLabels";
import { recordWordUse } from "@/services/wordUsage";

const TAB = 12;
const OUTER_RADIUS = 20;
const JOINT_RADIUS = 8;
const SPEAKER_BODY = 72;
const MIN_BODY = 80;
const MAX_BODY = 140;
const IMAGE_SIZE = 40;
const PIECE_HEIGHT = 88;
const LABEL_CHAR = 0.7;
const LABEL_SLACK = 10;
const LABEL_MAX = 220;

interface PhraseCardProps {
  phrase: PhraseItem[];
  images?: Map<string, ImageSourcePropType>;
  onManage?: () => void;
  onRemoveItem?: (index: number) => void;
  onReorder?: (from: number, to: number) => void;
  onDraggingChange?: (dragging: boolean) => void;
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
  badge,
  overlap = true,
  children,
}: {
  bodyWidth: number;
  height: number;
  leftSocket: boolean;
  rightTab: boolean;
  fill: string;
  stroke: string;
  badge?: React.ReactNode;
  overlap?: boolean;
  children?: React.ReactNode;
}) {
  const width = bodyWidth + (rightTab ? TAB : 0);
  return (
    <View style={{ width, height, marginLeft: overlap && leftSocket ? -TAB : 0 }}>
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
      {badge}
    </View>
  );
}

function pieceImage(images: Map<string, ImageSourcePropType> | undefined, text: string) {
  const source =
    images?.get(text.trim().toLocaleLowerCase("pt-BR")) ??
    images?.get(pecBaseTitle(text).trim().toLocaleLowerCase("pt-BR"));
  return source ?? PEC_FALLBACK_IMAGE;
}

function labelSize(text: string, largeText: boolean) {
  if (text.length > 16) return 14;
  return largeText ? 18 : 16;
}

function widestLineLength(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 1;
  if (words.length === 1) return words[0].length;
  let best = words.join(" ").length;
  for (let split = 1; split < words.length; split += 1) {
    const left = words.slice(0, split).join(" ").length;
    const right = words.slice(split).join(" ").length;
    best = Math.min(best, Math.max(left, right));
  }
  return best;
}

function piecePadding(leftSocket: boolean, rightTab: boolean) {
  const left = leftSocket ? TAB + 6 : 8;
  const right = rightTab ? 8 : 6;
  return left + right;
}

function bodyWidthForLabel(text: string, textSize: number, leftSocket: boolean) {
  const textWidth = widestLineLength(text) * textSize * LABEL_CHAR + LABEL_SLACK;
  const width = Math.ceil(textWidth + piecePadding(leftSocket, true));
  return Math.max(MIN_BODY, Math.min(LABEL_MAX, width));
}

function pieceHeightFor(textSize: number) {
  const lineHeight = textSize + 4;
  return 16 + IMAGE_SIZE + 4 + lineHeight * 2 + 4;
}

function pieceStride(bodyWidth: number, index: number) {
  return bodyWidth + (index === 0 ? TAB : 0);
}

function dropIndex(from: number, translationX: number, strides: number[]) {
  "worklet";
  let index = from;
  if (translationX > 0) {
    let remaining = translationX;
    while (index < strides.length - 1) {
      const next = strides[index + 1] ?? 0;
      const step = ((strides[index] ?? 0) + next) / 2;
      if (remaining < step) break;
      remaining -= next;
      index += 1;
    }
  } else if (translationX < 0) {
    let remaining = -translationX;
    while (index > 0) {
      const previous = strides[index - 1] ?? 0;
      const step = ((strides[index] ?? 0) + previous) / 2;
      if (remaining < step) break;
      remaining -= previous;
      index -= 1;
    }
  }
  return index;
}

function slotShift(index: number, from: number, target: number, draggedStride: number) {
  "worklet";
  if (from < 0 || index === from) return 0;
  if (from < target && index > from && index <= target) return -draggedStride;
  if (from > target && index < from && index >= target) return draggedStride;
  return 0;
}

function DraggablePiece({
  index,
  enabled,
  scrollGesture,
  activeIndex,
  dragX,
  strides,
  onGrab,
  onDrop,
  onDragChange,
  children,
}: {
  index: number;
  enabled: boolean;
  scrollGesture: NativeGesture | null;
  activeIndex: SharedValue<number>;
  dragX: SharedValue<number>;
  strides: SharedValue<number[]>;
  onGrab: () => void;
  onDrop: (from: number, to: number) => void;
  onDragChange: (dragging: boolean) => void;
  children: React.ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    const from = activeIndex.value;
    const widths = strides.value;
    if (from < 0 || widths.length === 0) {
      return { transform: [{ translateX: 0 }, { scale: 1 }], zIndex: 0, elevation: 0 };
    }
    const target = dropIndex(from, dragX.value, widths);
    const draggedStride = widths[from] ?? 0;
    const dragging = index === from;
    const shift = dragging ? dragX.value : slotShift(index, from, target, draggedStride);
    return {
      transform: [{ translateX: shift }, { scale: dragging ? 1.04 : 1 }],
      zIndex: dragging ? 8 : 1,
      elevation: dragging ? 8 : 0,
    };
  });

  const pan = usePanGesture(
    useMemo(
      () => ({
        enabled,
        activeOffsetX: [-10, 10] as [number, number],
        failOffsetY: [-16, 16] as [number, number],
        cancelsTouchesInView: false,
        ...(scrollGesture ? { block: scrollGesture } : {}),
        onActivate: () => {
          "worklet";
          activeIndex.value = index;
          dragX.value = 0;
          runOnJS(onDragChange)(true);
          runOnJS(onGrab)();
        },
        onUpdate: (event: { translationX: number }) => {
          "worklet";
          dragX.value = event.translationX;
        },
        onFinalize: (event: { canceled: boolean }) => {
          "worklet";
          const from = activeIndex.value;
          const widths = strides.value;
          const to = from < 0 || event.canceled ? from : dropIndex(from, dragX.value, widths);
          activeIndex.value = -1;
          dragX.value = 0;
          runOnJS(onDragChange)(false);
          if (!event.canceled && from >= 0 && to !== from) runOnJS(onDrop)(from, to);
        },
      }),
      [activeIndex, dragX, enabled, index, onDragChange, onDrop, onGrab, scrollGesture, strides],
    ),
  );

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ marginLeft: index > 0 ? -TAB : 0 }, style]}>{children}</Animated.View>
    </GestureDetector>
  );
}

export function PhraseCard({ phrase, images, onManage, onRemoveItem, onReorder, onDraggingChange }: PhraseCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const { settings, speak, stopSpeaking, haptic } = useAppSettings();
  const { profile } = useProfile();
  const copy = useI18n();
  const scale = useSharedValue(1);
  const longPressed = useRef(false);
  const [rowWidth, setRowWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [scrollGesture, setScrollGesture] = useState<NativeGesture | null>(null);
  const activeIndex = useSharedValue(-1);
  const dragX = useSharedValue(0);
  const strides = useSharedValue<number[]>([]);
  const reorderRef = useRef(onReorder);
  reorderRef.current = onReorder;

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
    speak(pecPhrase(phrase.map((item) => item.text), profile.sex));
    if (!onRemoveItem) phrase.forEach((item) => recordWordUse(item.text, item.color));
  }, [haptic, onRemoveItem, phrase, profile.sex, scale, speak]);

  const handleLongPress = useCallback(() => {
    longPressed.current = true;
    stopSpeaking();
    if (!onManage) return;
    haptic();
    onManage();
  }, [haptic, onManage, stopSpeaking]);

  const available = rowWidth || Math.max(0, windowWidth - 32);
  const specs = phrase.map((item, index) => {
    const text = pecLabel(item.text, profile.sex);
    const textSize = labelSize(text, settings.largeText);
    return {
      textSize,
      bodyWidth: bodyWidthForLabel(text, textSize, index > 0),
    };
  });
  const pieceHeight = specs.reduce((height, spec) => Math.max(height, pieceHeightFor(spec.textSize)), PIECE_HEIGHT);
  const preferredTotal = specs.reduce((sum, spec) => sum + spec.bodyWidth, 0) + SPEAKER_BODY;
  const growBudget = specs.reduce((sum, spec) => sum + Math.max(0, MAX_BODY - spec.bodyWidth), 0);
  const extra = Math.max(0, available - preferredTotal);
  const grow = preferredTotal <= available && growBudget > 0 ? Math.min(1, extra / growBudget) : 0;
  const bodyWidths = specs.map((spec) => spec.bodyWidth + Math.max(0, MAX_BODY - spec.bodyWidth) * grow);
  const strideKey = bodyWidths.map((body, index) => pieceStride(body, index)).join(",");
  useEffect(() => {
    strides.value = strideKey.length === 0 ? [] : strideKey.split(",").map(Number);
  }, [strideKey, strides]);
  const grabPiece = useCallback(() => {
    haptic();
  }, [haptic]);
  const dropPiece = useCallback((from: number, to: number) => {
    reorderRef.current?.(from, to);
  }, []);
  const changeDragging = useCallback(
    (next: boolean) => {
      setDragging(next);
      onDraggingChange?.(next);
    },
    [onDraggingChange],
  );
  const rememberScroll = useCallback((gesture: NativeGesture) => {
    setScrollGesture((current) => (current?.handlerTag === gesture.handlerTag ? current : gesture));
  }, []);
  const contentWidth = bodyWidths.reduce((sum, width) => sum + width, 0) + SPEAKER_BODY;
  const sideInset = onRemoveItem ? 30 : 0;
  const needsScroll = contentWidth + sideInset > available + 1;
  const stroke = settings.highContrast ? colors.dark : "rgba(0, 29, 74, 0.12)";

  const wordPieces = phrase.map((item, index) => {
    const textSize = specs[index]?.textSize ?? labelSize(pecLabel(item.text, profile.sex), settings.largeText);
    const bodyWidth = bodyWidths[index] ?? MIN_BODY;
    const body = (
      <>
        <View
          style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: 12,
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
          style={{ alignSelf: "stretch", color: colors.dark, marginTop: 4, lineHeight: textSize + 4 }}
        >
          {pecLabel(item.text, profile.sex)}
        </PillText>
      </>
    );
    const piece = (
      <PuzzlePiece
        bodyWidth={bodyWidth}
        height={pieceHeight}
        leftSocket={index > 0}
        rightTab
        overlap={!onReorder}
        fill={settings.highContrast ? colors.white : getCategoryBgColor(item.color)}
        stroke={stroke}
        badge={
          onRemoveItem ? (
            <View style={{ position: "absolute", top: -18, left: -16, zIndex: 3 }}>
              <IconButton
                icon="close-circle"
                accessibilityLabel={copy.phrases.remove(pecLabel(item.text, profile.sex))}
                variant="muted"
                size="sm"
                onPress={() => onRemoveItem(index)}
              />
            </View>
          ) : null
        }
      >
        {body}
      </PuzzlePiece>
    );
    if (!onReorder) return <React.Fragment key={`${item.text}-${index}`}>{piece}</React.Fragment>;
    return (
      <DraggablePiece
        key={`${item.text}-${index}`}
        index={index}
        enabled={phrase.length > 1}
        scrollGesture={scrollGesture}
        activeIndex={activeIndex}
        dragX={dragX}
        strides={strides}
        onGrab={grabPiece}
        onDrop={dropPiece}
        onDragChange={changeDragging}
      >
        {piece}
      </DraggablePiece>
    );
  });

  const speaker = (
    <PuzzlePiece
      bodyWidth={SPEAKER_BODY}
      height={pieceHeight}
      leftSocket={phrase.length > 0}
      rightTab={false}
      fill={colors.primaryWash}
      stroke={stroke}
    >
      <SolarIcon name="volume-loud" size={28} color={colors.primary} />
    </PuzzlePiece>
  );

  const pieces = onRemoveItem ? (
    <View style={{ paddingTop: 22, paddingLeft: 22, paddingRight: 8, paddingBottom: 4 }}>
      <View style={{ flexDirection: "row", width: contentWidth, alignItems: "center" }}>
        {wordPieces}
        <Pressable accessibilityLabel={copy.phrases.listen} onPress={handlePress}>
          {speaker}
        </Pressable>
      </View>
    </View>
  ) : (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={pecPhrase(phrase.map((item) => item.text), profile.sex)}
      accessibilityHint={onManage ? copy.phrases.hold : undefined}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={450}
      style={{ flexDirection: "row", width: contentWidth, alignItems: "center" }}
    >
      {wordPieces}
      {speaker}
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
          paddingHorizontal: 0,
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
      <GestureScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        scrollEnabled={needsScroll && !dragging}
        showsHorizontalScrollIndicator={false}
        style={{ width: "100%" }}
        contentContainerStyle={needsScroll ? undefined : { flexGrow: 1 }}
        onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER={onReorder ? rememberScroll : undefined}
      >
        {pieces}
      </GestureScrollView>
    </Animated.View>
  );
}

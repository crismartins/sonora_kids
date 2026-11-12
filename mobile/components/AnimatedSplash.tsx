import { useEffect, useRef, useState } from "react";
import { Animated, Platform, StatusBar, StyleSheet, useWindowDimensions } from "react-native";
import LottieView from "lottie-react-native";
import * as SplashScreen from "expo-splash-screen";
import { colors } from "@/constants/colors";

const splashAnimation = require("@/assets/animations/splash.json");

const LOOP_COUNT = 3;
const PLAY_MS = 1500;
const MIN_VISIBLE_MS = LOOP_COUNT * PLAY_MS;
const FALLBACK_MS = MIN_VISIBLE_MS + 2000;
const FADE_MS = 280;
const ARTBOARD_RATIO = 164 / 120;

type AnimatedSplashProps = {
  hold: boolean;
  onHidden: () => void;
};

export function AnimatedSplash({ hold, onHidden }: AnimatedSplashProps) {
  const window = useWindowDimensions();
  const [box, setBox] = useState({ width: window.width, height: window.height });
  const animationRef = useRef<LottieView>(null);
  const playedRef = useRef(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const startedAt = useRef(Date.now());
  const lastPlayAt = useRef(Date.now());
  const playsFinished = useRef(0);
  const nativeSplashHidden = useRef(false);
  const finishScheduled = useRef(false);
  const animationEnded = useRef(false);
  const hiding = useRef(false);
  const mounted = useRef(true);
  const holdRef = useRef(hold);
  const onHiddenRef = useRef(onHidden);
  holdRef.current = hold;
  onHiddenRef.current = onHidden;

  const hide = () => {
    if (!mounted.current || !animationEnded.current || holdRef.current || hiding.current) return;
    hiding.current = true;
    StatusBar.setBarStyle("dark-content");
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_MS,
      useNativeDriver: Platform.OS !== "android",
    }).start(() => {
      if (mounted.current) onHiddenRef.current();
    });
  };

  const finishAnimation = () => {
    if (finishScheduled.current || animationEnded.current) return;
    finishScheduled.current = true;
    const elapsed = Date.now() - startedAt.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(() => {
      if (!mounted.current) return;
      animationEnded.current = true;
      hide();
    }, wait);
  };

  const handleAnimationFinish = (isCancelled: boolean) => {
    if (isCancelled || animationEnded.current || finishScheduled.current) return;
    const now = Date.now();
    if (now - lastPlayAt.current < PLAY_MS - 300) return;
    lastPlayAt.current = now;
    playsFinished.current += 1;
    if (playsFinished.current < LOOP_COUNT) {
      animationRef.current?.reset();
      animationRef.current?.play();
      return;
    }
    finishAnimation();
  };

  const finishAnimationRef = useRef(finishAnimation);
  finishAnimationRef.current = finishAnimation;

  useEffect(() => {
    mounted.current = true;
    const fallback = setTimeout(() => finishAnimationRef.current(), FALLBACK_MS);
    return () => {
      mounted.current = false;
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!hold) hide();
  }, [hold]);

  const hideNativeSplash = () => {
    if (nativeSplashHidden.current) return;
    nativeSplashHidden.current = true;
    SplashScreen.hideAsync().catch(() => {});
  };

  const play = () => {
    if (playedRef.current || !animationRef.current) return;
    playedRef.current = true;
    requestAnimationFrame(() => {
      animationRef.current?.play();
    });
  };

  let logoWidth = box.width * 0.37;
  let logoHeight = logoWidth * ARTBOARD_RATIO;
  const maxHeight = box.height * 0.29;
  if (logoHeight > maxHeight) {
    logoHeight = maxHeight;
    logoWidth = logoHeight / ARTBOARD_RATIO;
  }

  return (
    <Animated.View
      accessibilityLabel="Sonora Kids"
      accessibilityRole="image"
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width <= 0 || height <= 0) return;
        setBox((current) => (current.width === width && current.height === height ? current : { width, height }));
        hideNativeSplash();
        play();
      }}
      style={[styles.overlay, { opacity }]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <LottieView
        ref={animationRef}
        source={splashAnimation}
        autoPlay={false}
        loop={false}
        resizeMode="contain"
        renderMode={Platform.OS === "android" ? "SOFTWARE" : "AUTOMATIC"}
        onAnimationLoaded={play}
        onAnimationFinish={handleAnimationFinish}
        onAnimationFailure={() => {
          animationEnded.current = true;
          hide();
        }}
        style={{
          position: "absolute",
          width: logoWidth,
          height: logoHeight,
          left: (box.width - logoWidth) / 2,
          top: (box.height - logoHeight) / 2,
        }}
        webStyle={{ width: logoWidth, height: logoHeight }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.white,
    zIndex: 100,
  },
});

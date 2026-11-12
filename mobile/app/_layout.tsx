import "../global.css";
import { useEffect, useState } from "react";
import { Platform, StatusBar } from "react-native";
import { router, Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Quicksand_700Bold } from "@expo-google-fonts/quicksand";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AnimatedSplash } from "@/components/AnimatedSplash";
import { OnboardingSlider } from "@/components/OnboardingSlider";
import { SilentModeToast } from "@/components/SilentModeToast";
import { AppSettingsProvider, useAppSettings } from "@/context/AppSettingsContext";
import { PremiumProvider } from "@/context/PremiumContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { FONT_FAMILY } from "@/constants/typography";
import { colors } from "@/constants/colors";
import { useI18n } from "@/i18n";
import { loadOnboardingSeen } from "@/services/onboarding";
import { ensurePecImageOverridesLoaded } from "@/services/pecImageOverrides";

SplashScreen.preventAutoHideAsync();
SystemUI.setBackgroundColorAsync(colors.primary);

function RootNavigator() {
  const { fontScale } = useAppSettings();
  const copy = useI18n();
  const headerTitleStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: Math.round(22 * fontScale),
  };
  const androidHeader = Platform.OS === "android"
    ? {
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
      }
    : {
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.white,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
      };

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile"
        options={{
          presentation: "modal",
          headerShown: true,
          title: copy.nav.profile,
          headerTitleStyle,
          headerTintColor: colors.dark,
          ...androidHeader,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: "modal",
          headerShown: true,
          title: copy.nav.settings,
          headerTitleStyle,
          headerTintColor: colors.dark,
          ...androidHeader,
        }}
      />
      <Stack.Screen
        name="pec"
        options={{
          presentation: "modal",
          headerShown: true,
          title: copy.nav.newPec,
          headerTitleStyle,
          headerTintColor: colors.dark,
          ...androidHeader,
        }}
      />
      <Stack.Screen
        name="frase"
        options={{
          presentation: "modal",
          headerShown: true,
          title: copy.nav.newPhrase,
          headerTitleStyle,
          headerTintColor: colors.dark,
          ...androidHeader,
        }}
      />
      <Stack.Screen
        name="rotina-item"
        options={{
          presentation: "modal",
          headerShown: true,
          title: copy.nav.routine,
          headerTitleStyle,
          headerTintColor: colors.dark,
          ...androidHeader,
        }}
      />
      <Stack.Screen
        name="premium"
        options={{
          presentation: "transparentModal",
          animation: "fade",
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </Stack>
  );
}

function AppShell({ initialOnboardingSeen }: { initialOnboardingSeen: boolean }) {
  const [onboardingSeen, setOnboardingSeen] = useState(initialOnboardingSeen);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
      {onboardingSeen ? null : (
        <OnboardingSlider
          onDone={() => {
            setOnboardingSeen(true);
            router.push({ pathname: "/profile", params: { edit: "1" } });
          }}
        />
      )}
      <SilentModeToast />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Quicksand_700Bold,
  });
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);
  const [splashVisible, setSplashVisible] = useState(true);
  const [imagesReady, setImagesReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadOnboardingSeen()
      .then((seen) => {
        if (active) setOnboardingSeen(seen);
      })
      .catch(() => {
        if (active) setOnboardingSeen(true);
      });
    ensurePecImageOverridesLoaded().finally(() => {
      if (active) setImagesReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const ready = (fontsLoaded || fontError) && onboardingSeen !== null && imagesReady;

  useEffect(() => {
    if (!splashVisible) SystemUI.setBackgroundColorAsync(colors.white);
  }, [splashVisible]);

  return (
    <GestureHandlerRootView
      className="flex-1"
      style={{ backgroundColor: splashVisible ? colors.primary : colors.white }}
    >
      {ready && onboardingSeen !== null ? (
        <SafeAreaProvider>
          <AppSettingsProvider>
            <PremiumProvider>
              <ProfileProvider>
                <AppShell initialOnboardingSeen={onboardingSeen} />
              </ProfileProvider>
            </PremiumProvider>
          </AppSettingsProvider>
        </SafeAreaProvider>
      ) : null}
      {splashVisible ? (
        <AnimatedSplash hold={!ready} onHidden={() => setSplashVisible(false)} />
      ) : null}
    </GestureHandlerRootView>
  );
}

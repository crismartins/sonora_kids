import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Quicksand_700Bold } from "@expo-google-fonts/quicksand";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { OnboardingSlider } from "@/components/OnboardingSlider";
import { SilentModeToast } from "@/components/SilentModeToast";
import { AppSettingsProvider, useAppSettings } from "@/context/AppSettingsContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { FONT_FAMILY } from "@/constants/typography";
import { loadOnboardingSeen } from "@/services/onboarding";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { fontScale } = useAppSettings();
  const headerTitleStyle = {
    fontFamily: FONT_FAMILY,
    fontWeight: "700" as const,
    fontSize: Math.round(22 * fontScale),
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Perfil",
          headerTitleStyle,
          headerTintColor: "#001D4A",
          headerStyle: { backgroundColor: "#FDFEFF" },
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Configurações",
          headerTitleStyle,
          headerTintColor: "#001D4A",
          headerStyle: { backgroundColor: "#FDFEFF" },
        }}
      />
    </Stack>
  );
}

function AppShell({ initialOnboardingSeen }: { initialOnboardingSeen: boolean }) {
  const [onboardingSeen, setOnboardingSeen] = useState(initialOnboardingSeen);

  return (
    <>
      <StatusBar style="dark" />
      <RootNavigator />
      {onboardingSeen ? null : <OnboardingSlider onDone={() => setOnboardingSeen(true)} />}
      <SilentModeToast />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Quicksand_700Bold,
  });
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    loadOnboardingSeen()
      .then((seen) => {
        if (active) setOnboardingSeen(seen);
      })
      .catch(() => {
        if (active) setOnboardingSeen(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const ready = (fontsLoaded || fontError) && onboardingSeen !== null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready || onboardingSeen === null) {
    return null;
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <AppSettingsProvider>
          <ProfileProvider>
            <AppShell initialOnboardingSeen={onboardingSeen} />
          </ProfileProvider>
        </AppSettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

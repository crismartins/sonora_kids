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
import { OnboardingSlider } from "@/components/OnboardingSlider";
import { SilentModeToast } from "@/components/SilentModeToast";
import { AppSettingsProvider, useAppSettings } from "@/context/AppSettingsContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { FONT_FAMILY } from "@/constants/typography";
import { colors } from "@/constants/colors";
import { loadOnboardingSeen } from "@/services/onboarding";

SplashScreen.preventAutoHideAsync();
SystemUI.setBackgroundColorAsync(colors.white);

function RootNavigator() {
  const { fontScale } = useAppSettings();
  const headerTitleStyle = {
    fontFamily: FONT_FAMILY,
    fontSize: Math.round(20 * fontScale),
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
          title: "Perfil",
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
          title: "Configurações",
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
          title: "Novo PEC",
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
          title: "Nova frase",
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
          title: "Rotina",
          headerTitleStyle,
          headerTintColor: colors.dark,
          ...androidHeader,
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
    <GestureHandlerRootView className="flex-1 bg-white">
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

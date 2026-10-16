import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Quicksand_700Bold } from "@expo-google-fonts/quicksand";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppSettingsProvider, useAppSettings } from "@/context/AppSettingsContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { FONT_FAMILY } from "@/constants/typography";

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

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Quicksand_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <AppSettingsProvider>
          <ProfileProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </ProfileProvider>
        </AppSettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

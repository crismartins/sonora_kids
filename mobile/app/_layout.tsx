import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Dongle-Regular": require("../assets/fonts/Dongle-Regular.ttf"),
    "Dongle-Bold": require("../assets/fonts/Dongle-Bold.ttf"),
    "Dongle-Light": require("../assets/fonts/Dongle-Light.ttf"),
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="profile"
              options={{
                presentation: "modal",
                headerShown: true,
                title: "Perfil",
                headerTitleStyle: {
                  fontFamily: "Dongle-Bold",
                  fontSize: 28,
                },
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
                headerTitleStyle: {
                  fontFamily: "Dongle-Bold",
                  fontSize: 28,
                },
                headerTintColor: "#001D4A",
                headerStyle: { backgroundColor: "#FDFEFF" },
              }}
            />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

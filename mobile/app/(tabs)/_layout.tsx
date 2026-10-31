import { useCallback, useRef } from "react";
import { Tabs, usePathname } from "expo-router";
import { Platform, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { SolarIcon } from "@/components/SolarIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { FLOATING_TAB_BAR_HEIGHT, FLOATING_TAB_BAR_HORIZONTAL, floatingTabBarBottom } from "@/constants/tabBar";
import { FONT_FAMILY } from "@/constants/typography";
import { useAppSettings } from "@/context/AppSettingsContext";

const TAB_TITLES: Record<string, string> = {
  index: "PECS",
  frases: "Frases",
  aprender: "Aprender",
  rotina: "Rotina",
};

function titleForPath(pathname: string) {
  const segment = pathname.split("/").filter(Boolean).pop();
  if (!segment || segment === "(tabs)" || segment === "index") return TAB_TITLES.index;
  return TAB_TITLES[segment] ?? TAB_TITLES.index;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { fontScale, settings, speak } = useAppSettings();
  const autoSpeakRef = useRef(settings.autoSpeakCategories);
  autoSpeakRef.current = settings.autoSpeakCategories;
  const pathname = usePathname();
  const tabBarBottom = floatingTabBarBottom(insets.bottom);

  const screenListeners = useCallback(
    ({ route }: { route: { name: string } }) => ({
      tabPress: () => {
        if (!autoSpeakRef.current) return;
        const title = TAB_TITLES[route.name];
        if (title) speak(title);
      },
    }),
    [speak],
  );

  return (
    <View className="flex-1 bg-white">
      <AppHeader title={titleForPath(pathname)} />
      <Tabs
        safeAreaInsets={{ bottom: 0 }}
        screenListeners={screenListeners}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.neutralDark,
          tabBarLabelPosition: "below-icon",
          tabBarStyle: {
            position: "absolute",
            left: FLOATING_TAB_BAR_HORIZONTAL,
            right: FLOATING_TAB_BAR_HORIZONTAL,
            bottom: tabBarBottom,
            height: FLOATING_TAB_BAR_HEIGHT,
            borderRadius: FLOATING_TAB_BAR_HEIGHT / 2,
            backgroundColor: colors.white,
            borderTopWidth: 0,
            borderWidth: 0,
            opacity: 0.95,
            paddingTop: 8,
            paddingBottom: 8,
            marginHorizontal: 16,
            ...(Platform.OS === "android"
              ? { elevation: 0, shadowOpacity: 0, borderColor: "transparent" }
              : { shadowOffset: { width: 0, height: 4 }, elevation: 6 }),
          },
          tabBarLabelStyle: {
            fontFamily: FONT_FAMILY,
            fontSize: Math.round(11 * fontScale),
          },
          tabBarItemStyle: { paddingVertical: 4 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Pecs",
            tabBarLabel: "PECS",
            tabBarIcon: ({ color }) => <SolarIcon name="widget" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="frases"
          options={{
            title: "Frases",
            tabBarLabel: "FRASES",
            tabBarIcon: ({ color }) => <SolarIcon name="chat-square-line" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="aprender"
          options={{
            title: "Aprender",
            tabBarLabel: "APRENDER",
            tabBarIcon: ({ color }) => <SolarIcon name="square-academic-cap" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="rotina"
          options={{
            title: "Rotina",
            tabBarLabel: "ROTINA",
            tabBarIcon: ({ color }) => <SolarIcon name="clock" size={24} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

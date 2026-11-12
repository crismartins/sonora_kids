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
import { useI18n } from "@/i18n";

function titleForPath(pathname: string, titles: Record<string, string>) {
  const segment = pathname.split("/").filter(Boolean).pop();
  if (!segment || segment === "(tabs)" || segment === "index") return titles.index;
  return titles[segment] ?? titles.index;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { fontScale, settings, speak } = useAppSettings();
  const copy = useI18n();
  const autoSpeakRef = useRef(settings.autoSpeakCategories);
  autoSpeakRef.current = settings.autoSpeakCategories;
  const pathname = usePathname();
  const tabBarBottom = floatingTabBarBottom(insets.bottom);
  const tabTitles: Record<string, string> = {
    index: copy.tabs.pecsTitle,
    frases: copy.tabs.phrasesTitle,
    aprender: copy.tabs.learnTitle,
    rotina: copy.tabs.routineTitle,
  };

  const screenListeners = useCallback(
    ({ route }: { route: { name: string } }) => ({
      tabPress: () => {
        if (!autoSpeakRef.current) return;
        const title = tabTitles[route.name];
        if (title) speak(title);
      },
    }),
    [speak, tabTitles],
  );

  return (
    <View className="flex-1 bg-white" style={{ flex: 1 }}>
      <AppHeader title={titleForPath(pathname, tabTitles)} />
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
            title: copy.tabs.pecsTitle,
            tabBarLabel: copy.tabs.pecs,
            tabBarIcon: ({ color }) => <SolarIcon name="widget" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="frases"
          options={{
            title: copy.tabs.phrasesTitle,
            tabBarLabel: copy.tabs.phrases,
            tabBarIcon: ({ color }) => <SolarIcon name="chat-square-line" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="aprender"
          options={{
            title: copy.tabs.learnTitle,
            tabBarLabel: copy.tabs.learn,
            tabBarIcon: ({ color }) => <SolarIcon name="square-academic-cap" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="rotina"
          options={{
            title: copy.tabs.routineTitle,
            tabBarLabel: copy.tabs.routine,
            tabBarIcon: ({ color }) => <SolarIcon name="clock" size={24} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

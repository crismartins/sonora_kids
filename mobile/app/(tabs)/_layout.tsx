import { useCallback, useRef } from "react";
import { Tabs, router } from "expo-router";
import { Pressable, Image } from "react-native";
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { FLOATING_TAB_BAR_HEIGHT, FLOATING_TAB_BAR_HORIZONTAL, floatingTabBarBottom } from "@/constants/tabBar";
import { FONT_FAMILY } from "@/constants/typography";
import { useAppSettings } from "@/context/AppSettingsContext";

const TAB_TITLES: Record<string, string> = {
  index: "Pecs",
  frases: "Frases",
  aprender: "Aprender",
  rotina: "Rotina",
};

const AVATAR = require("../../assets/images/avatar_default_v1.png");

function HeaderLeft() {
  return (
    <Pressable
      onPress={() => router.push("/settings")}
      className="ml-4 h-9 w-9 items-center justify-center rounded-[10px] bg-[#E3F2FD]"
    >
      <Ionicons name="settings-outline" size={20} color={colors.primary} />
    </Pressable>
  );
}

function HeaderRight() {
  return (
    <Pressable onPress={() => router.push("/profile")} className="mr-4 h-9 w-9 overflow-hidden rounded-full bg-neutral">
      <Image source={AVATAR} className="h-9 w-9" />
    </Pressable>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { fontScale, settings, speak } = useAppSettings();
  const autoSpeakRef = useRef(settings.autoSpeakCategories);
  autoSpeakRef.current = settings.autoSpeakCategories;
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
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      screenListeners={screenListeners}
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTitleStyle: {
          fontFamily: FONT_FAMILY,
          fontWeight: "700",
          fontSize: Math.round(22 * fontScale),
          color: colors.dark,
        },
        headerShadowVisible: false,
        headerTintColor: colors.dark,
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
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
          backgroundColor: "#FFFF",
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 8,
          borderWidth: 1,
          borderColor: "#E4F4FF",
          shadowColor: "#001D4A",
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
          marginHorizontal: 16,
        },
        tabBarLabelStyle: {
          fontFamily: FONT_FAMILY,
          fontWeight: "700",
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
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="card-multiple-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="frases"
        options={{
          title: "Frases",
          tabBarLabel: "FRASES",
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="aprender"
        options={{
          title: "Aprender",
          tabBarLabel: "APRENDER",
          tabBarIcon: ({ color }) => <MaterialIcons name="sports-esports" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rotina"
        options={{
          title: "Rotina",
          tabBarLabel: "ROTINA",
          tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

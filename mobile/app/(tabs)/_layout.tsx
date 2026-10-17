import { useCallback, useRef } from "react";
import { Tabs, router } from "expo-router";
import { Pressable, Image, View } from "react-native";
import { SolarIcon } from "@/components/SolarIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { FLOATING_TAB_BAR_HEIGHT, FLOATING_TAB_BAR_HORIZONTAL, floatingTabBarBottom } from "@/constants/tabBar";
import { FONT_FAMILY } from "@/constants/typography";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useProfile } from "@/context/ProfileContext";
import { profileAvatarSource } from "@/services/profile";

const TAB_TITLES: Record<string, string> = {
  index: "Pecs",
  frases: "Frases",
  aprender: "Aprender",
  rotina: "Rotina",
};

const PEC_CARD_TEXT_SIZE = 20;
const HEADER_TITLE_SIZE = PEC_CARD_TEXT_SIZE + 2;
const AVATAR_SIZE = 32;
const AVATAR_RADIUS = 12;
const AVATAR_BORDER = 3;
const AVATAR_RING = "#D7EEF8";

function HeaderLeft() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Abrir configurações"
      onPress={() => router.push("/settings")}
      hitSlop={12}
      style={{
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SolarIcon name="settings" size={24} color={colors.neutralDark} />
    </Pressable>
  );
}

function HeaderRight() {
  const { profile } = useProfile();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Abrir perfil"
      onPress={() => router.push("/profile")}
      hitSlop={8}
    >
      <View
        style={{
          borderWidth: AVATAR_BORDER,
          borderColor: AVATAR_RING,
          borderRadius: AVATAR_RADIUS + AVATAR_BORDER,
          overflow: "hidden",
        }}
      >
        <Image source={profileAvatarSource(profile)} style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} />
      </View>
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
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontFamily: FONT_FAMILY,
          fontWeight: "700",
          fontSize: Math.round(HEADER_TITLE_SIZE * fontScale),
          color: colors.dark,
        },
        headerShadowVisible: false,
        headerTintColor: colors.dark,
        headerLeftContainerStyle: { paddingLeft: 16 },
        headerRightContainerStyle: { paddingRight: 16 },
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
          opacity: 0.95,
          paddingTop: 8,
          paddingBottom: 8,
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
          tabBarIcon: ({ color }) => <SolarIcon name="widget" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="frases"
        options={{
          title: "Frases",
          tabBarLabel: "FRASES",
          tabBarIcon: ({ color }) => <SolarIcon name="chat-round-dots" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="aprender"
        options={{
          title: "Aprender",
          tabBarLabel: "APRENDER",
          tabBarIcon: ({ color }) => <SolarIcon name="gamepad" size={24} color={color} />,
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
  );
}

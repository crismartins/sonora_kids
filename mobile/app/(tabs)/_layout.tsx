import { Tabs, router } from "expo-router";
import { Pressable, Image, Platform } from "react-native";
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { FONT_FAMILY } from "@/constants/typography";
import { useAppSettings } from "@/context/AppSettingsContext";

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
    <Pressable
      onPress={() => router.push("/profile")}
      className="mr-4 h-9 w-9 overflow-hidden rounded-full bg-neutral"
    >
      <Image source={AVATAR} className="h-9 w-9" />
    </Pressable>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { fontScale } = useAppSettings();
  const tabBarHeight = Platform.OS === "web" ? 84 : 60 + insets.bottom;

  return (
    <Tabs
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
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E4F4FF",
          height: tabBarHeight,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom,
          paddingTop: 6,
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
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="card-multiple-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="frases"
        options={{
          title: "Frases",
          tabBarLabel: "FRASES",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubbles-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="aprender"
        options={{
          title: "Aprender",
          tabBarLabel: "APRENDER",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="sports-esports" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rotina"
        options={{
          title: "Rotina",
          tabBarLabel: "ROTINA",
          tabBarIcon: ({ color }) => (
            <Ionicons name="time-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

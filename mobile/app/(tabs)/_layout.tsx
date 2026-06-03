import { Tabs, router } from "expo-router";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";

const AVATAR = require("../../assets/images/avatar_default_v1.png");

function HeaderLeft() {
  return (
    <Pressable
      onPress={() => router.push("/settings")}
      style={styles.headerBtn}
    >
      <Ionicons name="settings-outline" size={22} color={colors.neutralDark} />
    </Pressable>
  );
}

function HeaderRight() {
  return (
    <Pressable
      onPress={() => router.push("/profile")}
      style={styles.avatarBtn}
    >
      <Image source={AVATAR} style={styles.avatar} />
    </Pressable>
  );
}

function TabBarBackground() {
  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={60}
        tint="systemChromeMaterialLight"
        style={StyleSheet.absoluteFill}
      />
    );
  }
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: `${colors.neutralLight}F5` }]}
    />
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarBottom = Platform.OS === "web" ? 34 : insets.bottom + 8;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.neutralLight },
        headerTitleStyle: {
          fontFamily: "Dongle-Bold",
          fontSize: 30,
          color: colors.dark,
        },
        headerTintColor: colors.dark,
        headerShadowVisible: false,
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.neutralDark,
        tabBarStyle: {
          position: "absolute",
          bottom: tabBarBottom,
          left: 20,
          right: 20,
          height: 68,
          borderRadius: 40,
          borderTopWidth: 0,
          backgroundColor: "transparent",
          elevation: 8,
          boxShadow:
            Platform.OS === "web"
              ? `0px 4px 24px ${colors.dark}22`
              : undefined,
          paddingBottom: 0,
          overflow: Platform.OS === "android" ? "hidden" : "visible",
        },
        tabBarBackground: () => <TabBarBackground />,
        tabBarLabelStyle: {
          fontFamily: "Dongle-Bold",
          fontSize: 12,
          marginBottom: 4,
        },
        tabBarIconStyle: { marginTop: 6 },
        tabBarItemStyle: { paddingVertical: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Pecs",
          tabBarLabel: "PECS",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="card-multiple-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="frases"
        options={{
          title: "Frases",
          tabBarLabel: "FRASES",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubbles-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="aprender"
        options={{
          title: "Aprender",
          tabBarLabel: "APRENDER",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="school" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rotina"
        options={{
          title: "Rotina",
          tabBarLabel: "ROTINA",
          tabBarIcon: ({ color }) => (
            <Ionicons name="time-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerBtn: {
    marginLeft: 16,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.neutral,
  },
  avatarBtn: {
    marginRight: 16,
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.neutral,
  },
  avatar: {
    width: 36,
    height: 36,
  },
});

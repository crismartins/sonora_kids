import { Tabs, router } from "expo-router";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";

const AVATAR = require("../../assets/images/avatar_default_v1.png");

function HeaderLeft() {
  return (
    <Pressable
      onPress={() => router.push("/settings")}
      style={styles.headerIconBtn}
    >
      <Ionicons name="settings-outline" size={20} color={colors.primary} />
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

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === "web" ? 84 : 60 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTitleStyle: {
          fontFamily: "Dongle-Bold",
          fontSize: 28,
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
          fontFamily: "Dongle-Bold",
          fontSize: 13,
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

const styles = StyleSheet.create({
  headerIconBtn: {
    marginLeft: 16,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBtn: {
    marginRight: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#E4F4FF",
  },
  avatar: {
    width: 36,
    height: 36,
  },
});

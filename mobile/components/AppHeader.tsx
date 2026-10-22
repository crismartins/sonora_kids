import { Platform, Pressable, Image, View, Text } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SolarIcon } from "@/components/SolarIcon";
import { colors } from "@/constants/colors";
import { FONT_FAMILY } from "@/constants/typography";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useProfile } from "@/context/ProfileContext";
import { profileAvatarSource } from "@/services/profile";

const HEADER_TITLE_SIZE = 22;
const AVATAR_SIZE = 32;
const AVATAR_RADIUS = 12;
const AVATAR_BORDER = 3;
const AVATAR_RING = "#D7EEF8";
const BAR_HEIGHT = Platform.OS === "ios" ? 44 : 64;

export function AppHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  const { fontScale } = useAppSettings();
  const { profile } = useProfile();

  return (
    <View className="bg-white" style={{ paddingTop: insets.top }}>
      <View pointerEvents="box-none" className="items-center justify-center px-16" style={{ height: BAR_HEIGHT }}>
        <Text
          numberOfLines={1}
          className="font-quicksand text-dark"
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: Math.round(HEADER_TITLE_SIZE * fontScale),
          }}
        >
          {title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir configurações"
          onPress={() => router.push("/settings")}
          hitSlop={12}
          className="absolute left-4 h-6 w-6 items-center justify-center"
        >
          <SolarIcon name="settings" size={28} color={colors.neutralDark} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
          onPress={() => router.push("/profile")}
          hitSlop={8}
          className="absolute right-4"
        >
          <View
            style={{
              borderWidth: AVATAR_BORDER,
              borderColor: AVATAR_RING,
              borderRadius: AVATAR_RADIUS + AVATAR_BORDER,
              overflow: "hidden",
            }}
          >
            <Image
              fadeDuration={0}
              source={profileAvatarSource(profile)}
              style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

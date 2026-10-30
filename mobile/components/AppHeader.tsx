import { Platform, Pressable, Image, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SolarIcon } from "@/components/SolarIcon";
import { ScreenTitle } from "@/components/ScreenTitle";
import { colors } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { profileAvatarSource } from "@/services/profile";

const AVATAR_SIZE = 32;
const AVATAR_RADIUS = 12;
const AVATAR_BORDER = 4;
const AVATAR_RING = colors.light;
const BAR_HEIGHT = Platform.OS === "ios" ? 44 : 64;

export function AppHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();

  return (
    <View className="bg-white" style={{ paddingTop: insets.top }}>
      <View pointerEvents="box-none" className="items-center justify-center px-16" style={{ height: BAR_HEIGHT }}>
        <ScreenTitle>{title}</ScreenTitle>
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

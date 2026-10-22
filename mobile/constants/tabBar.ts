import { Platform } from "react-native";

export const FLOATING_TAB_BAR_HEIGHT = 72;
/** PECS grid outer edge: list padding (10) + card margin (5). */
export const CARD_GRID_INSET = 15;
export const FLOATING_TAB_BAR_HORIZONTAL = CARD_GRID_INSET;

export function floatingTabBarBottom(bottomInset: number) {
  if (Platform.OS === "android") return bottomInset + 16;
  const inset = Platform.OS === "web" ? Math.max(bottomInset, 0) : bottomInset;
  return inset - 15;
}

/** Space from the bottom of the screen up to the top of the floating tab bar. */
export function tabBarClearance(bottomInset: number) {
  return FLOATING_TAB_BAR_HEIGHT + floatingTabBarBottom(bottomInset);
}

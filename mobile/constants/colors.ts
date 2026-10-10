export const colors = {
  primary: "#2567FF",
  primaryLight: "#107EFF",
  primaryDark: "#2B40FA",
  dark: "#001D4A",
  light: "#CEE5FF",
  neutral: "#E4F4FF",
  neutralLight: "#FDFEFF",
  neutralDark: "#89ACC7",
};

export const categoryColorMap: Record<string, string> = {
  greenAccent: "#00897B",
  orange: "#EF6C00",
  deepOrange: "#BF360C",
  pink: "#AD1457",
  blue: "#1565C0",
  teal: "#00695C",
  deepPurple: "#4527A0",
  brown: "#4E342E",
  cyan: "#00838F",
  blueGrey: "#37474F",
  grey: "#616161",
  lightGreen: "#558B2F",
  purple: "#6A1B9A",
  indigo: "#283593",
  yellow: "#F9A825",
  amber: "#F57F17",
};

export const categoryBgColorMap: Record<string, string> = {
  greenAccent: "#E0F2F1",
  orange: "#FBE9E7",
  deepOrange: "#FBE9E7",
  pink: "#FCE4EC",
  blue: "#E3F2FD",
  teal: "#E0F2F1",
  deepPurple: "#EDE7F6",
  brown: "#EFEBE9",
  cyan: "#E0F7FA",
  blueGrey: "#ECEFF1",
  grey: "#F5F5F5",
  lightGreen: "#F1F8E9",
  purple: "#F3E5F5",
  indigo: "#E8EAF6",
  yellow: "#FFFDE7",
  amber: "#FFF8E1",
};

export function getCategoryColor(colorName: string): string {
  return categoryColorMap[colorName] ?? colors.neutralDark;
}

export function getCategoryBgColor(colorName: string): string {
  return categoryBgColorMap[colorName] ?? colors.neutral;
}

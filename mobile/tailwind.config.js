/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2567FF",
        "primary-light": "#107EFF",
        "primary-dark": "#2B40FA",
        "primary-soft": "#F0F8FF",
        "primary-wash": "#E3F2FD",
        dark: "#001D4A",
        light: "#CEE5FF",
        neutral: "#E4F4FF",
        "neutral-light": "#FDFEFF",
        "neutral-dark": "#89ACC7",
        muted: "#F5F5F5",
        line: "#F0F0F0",
        canvas: "#FAFAFA",
        danger: "#D32F2F",
        "danger-soft": "#FDECEC",
      },
      fontFamily: {
        quicksand: ["Quicksand_700Bold"],
      },
    },
  },
  plugins: [],
};

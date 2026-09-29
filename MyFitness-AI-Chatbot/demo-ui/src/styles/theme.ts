/* src/styles/theme.css — design tokens extracted from globals.css for JS theming */
export const tokens = {
  colors: {
    background: "0 0% 100%",
    foreground: "222.2 84% 4.9%",
    card: "0 0% 100%",
    cardForeground: "222.2 84% 4.9%",
    primary: "142 76% 36%",
    primaryForeground: "0 0% 100%",
    muted: "214.3 31.8% 91.4%",
    mutedForeground: "215.4 16.3% 46.9%",
    accent: "220 98% 60%",
    success: "142 76% 36%",
    warning: "43 96% 56%",
    danger: "0 84% 60%",
    border: "214.3 31.8% 91.4%",
    input: "214.3 31.8% 91.4%",
    radius: "0.5rem",
  },
  // Active/dark theme overrides
  dark: {
    background: "222.2 84% 4.9%",
    foreground: "210 40% 98.0%",
    card: "222.2 84% 4.9%",
    cardForeground: "210 40% 98.0%",
    primaryForeground: "0 0% 100%",
    muted: "215 27.9% 16.9%",
    mutedForeground: "215 16.3% 46.9%",
  },
};

export function applyDarkTheme(root: HTMLElement) {
  root.style.setProperty("--background", tokens.dark.background);
  root.style.setProperty("--foreground", tokens.dark.foreground);
  root.style.setProperty("--card", tokens.dark.card);
  root.style.setProperty("--card-foreground", tokens.dark.cardForeground);
}
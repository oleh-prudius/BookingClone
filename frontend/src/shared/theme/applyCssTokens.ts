import { colors, darkColors } from "./tokens";

export function applyCssTokens(theme: 'light' | 'dark' = 'light') {
    const root = document.documentElement;
    const palette = theme === 'dark' ? darkColors : colors;

    for (const [key, value] of Object.entries(palette)) {
        root.style.setProperty(`--triply-${key}`, value);
    }

    root.dataset.theme = theme;
}

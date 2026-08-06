export const colors = {
    navyDarkest: "#061B3D",
    navyDark: "#0B2F73",
    blue: "#1565D8",
    primary: "#2F86F0",
    // Darker than `primary` — used for text/values on light backgrounds, where
    // `primary` alone fails WCAG contrast (its lightness is tuned for buttons, not text).
    textAccent: "#1565D8",
    backgroundLight: "#EAF2FF"
} as const;

export const darkColors = {
    navyDarkest: "#020A1C",
    navyDark: "#081F4D",
    blue: "#0D3E8C",
    primary: "#4F9BF0",
    // `primary` already has good contrast on dark backgrounds, so reuse it here.
    textAccent: "#4F9BF0",
    backgroundLight: "#0F1720"
} as const;

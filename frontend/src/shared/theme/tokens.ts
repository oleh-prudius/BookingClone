export const colors = {
    navyDarkest: "#061B3D",
    navyDark: "#0B2F73",
    blue: "#1565D8",
    // Figma design system's canonical button/icon blue (Frame202, Group108/109).
    primary: "#2563EB",
    // Same family as `primary` and close enough in lightness to double as text color.
    textAccent: "#2563EB",
    backgroundLight: "#EAF2FF"
} as const;

export const darkColors = {
    navyDarkest: "#020A1C",
    navyDark: "#081F4D",
    blue: "#0D3E8C",
    // Figma's lighter "default" icon-button tint (Group108/109) reads better on dark backgrounds.
    primary: "#60A5FA",
    textAccent: "#60A5FA",
    backgroundLight: "#0F1720"
} as const;

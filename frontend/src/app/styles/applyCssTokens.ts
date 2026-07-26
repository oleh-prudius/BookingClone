import {colors } from "./tokens";
export function applyCssTokens() {
    const root = document.documentElement;
    
    for (const [key, value] of Object.entries(colors)) {
        root.style.setProperty(`--triply-${key}`, value);
    }
}

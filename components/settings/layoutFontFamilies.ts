import { availableFonts } from '../../lib/themes';

// Fonts loaded by the app layout, expressed as CSS font stacks usable in report settings.
export const layoutFontFamilies: string[] = availableFonts
     .filter((font) => font.value.startsWith('var(--font-'))
     .map((font) => `${font.value}, ${font.name}, sans-serif`);

export const fontFamilyLabel = (value: string): string => {
     const match = value.match(/^var\(--font-[^)]+\),\s*([^,]+),/);
     return match ? match[1] : value;
};

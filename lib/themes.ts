export interface Theme {
     id: string;
     name: string;
     colors: {
          sidebarBg: string;
          sidebarText: string;
          sidebarHover: string;
          sidebarActive: string;
          sidebarBorder: string;
          headerBg: string;
          headerText: string;
          headerBorder: string;
          accent: string;
          bodyBg: string;
          cardBg: string;
     };
     layout: {
          sidebarWidth: string;
          borderRadius: string;
          sidebarStyle: 'modern' | 'classic' | 'minimal' | 'glass';
     };
}

export const themes: Theme[] = [];
export const DEFAULT_FONT_FAMILY = 'var(--font-raleway)';

export const getThemeById = (id: string): Theme => {
     const found = themes.find(t => t.id === id);
     if (found) return found;

     // Default theme when no themes are available
     return {
          id: 'default',
          name: 'Default',
          colors: {
               sidebarBg: '#27ae60',
               sidebarText: '#ffffff',
               sidebarHover: 'rgba(255, 255, 255, 0.1)',
               sidebarActive: 'rgba(255, 255, 255, 0.2)',
               sidebarBorder: 'transparent',
               headerBg: '#ffffff',
               headerText: '#2c3e50',
               headerBorder: '#e9ecef',
               accent: '#27ae60',
               bodyBg: '#f8f9fa',
               cardBg: '#ffffff'
          },
          layout: {
               sidebarWidth: '248px',
               borderRadius: '8px',
               sidebarStyle: 'modern'
          }
     };
};

export const saveThemePreference = (themeId: string) => {
     if (typeof window !== 'undefined') {
          localStorage.setItem('lobnos-theme-preference', themeId);
     }
};

export const getThemePreference = (): string => {
     if (typeof window !== 'undefined') {
          return localStorage.getItem('lobnos-theme-preference') || 'professional-green';
     }
     return 'professional-green';
};

export const applyThemeToDocument = (theme: Theme) => {
     if (typeof document === 'undefined') return;

     const root = document.documentElement;

     // Colors
     root.style.setProperty('--theme-sidebar-bg', theme.colors.sidebarBg);
     root.style.setProperty('--theme-sidebar-text', theme.colors.sidebarText);
     root.style.setProperty('--theme-sidebar-hover', theme.colors.sidebarHover);
     root.style.setProperty('--theme-sidebar-active', theme.colors.sidebarActive);
     root.style.setProperty('--theme-sidebar-border', theme.colors.sidebarBorder);

     root.style.setProperty('--theme-header-bg', theme.colors.headerBg);
     root.style.setProperty('--theme-header-text', theme.colors.headerText);
     root.style.setProperty('--theme-header-border', theme.colors.headerBorder);

     root.style.setProperty('--theme-accent', theme.colors.accent);
     root.style.setProperty('--theme-body-bg', theme.colors.bodyBg);
     root.style.setProperty('--theme-card-bg', theme.colors.cardBg);

     // Layout
     root.style.setProperty('--theme-sidebar-width', theme.layout.sidebarWidth);
     root.style.setProperty('--theme-border-radius', theme.layout.borderRadius);

     // Sidebar Style
     root.setAttribute('data-sidebar-style', theme.layout.sidebarStyle);

     // Layout Structure - Always set to sidebar-full for default full sidebar
     root.setAttribute('data-layout-structure', 'sidebar-full');
};

export const applyApplicationSettingsToDocument = (settings: any) => {
     if (typeof document === 'undefined' || !settings) return;

     const root = document.documentElement;
     const setIfPresent = (name: string, value: unknown) => {
          if (typeof value === 'string' && value.trim()) root.style.setProperty(name, value.trim());
     };

     setIfPresent('--theme-font-family', normalizeFontFamily(settings.fontFamily));
     setIfPresent('--theme-font-size', settings.fontsize);
     setIfPresent('--theme-text-color', settings.textcolor);
     const headerBackground = settings.headerColor || '#ffffff';
     const requestedHeaderText = settings.headerTextColor || '#2c3e50';
     const isLightHeader = /^(#fff(?:fff)?|white|#f[0-9a-f]{5}|#e[0-9a-f]{5})$/i.test(String(headerBackground).trim());
     const isLightHeaderText = /^(#fff(?:fff)?|white|#f[0-9a-f]{5}|#e[0-9a-f]{5})$/i.test(String(requestedHeaderText).trim());

     setIfPresent('--theme-header-bg', headerBackground);
     setIfPresent('--theme-header-text', isLightHeader && isLightHeaderText ? '#2c3e50' : requestedHeaderText);
     setIfPresent('--theme-sidebar-bg', settings.sidebarColor);
     setIfPresent('--theme-sidebar-text', settings.sidebarTextColor);
     setIfPresent('--theme-body-bg', settings.pageBackgroundColor || settings.BackgroundColor);
     setIfPresent('--theme-accent', settings.primaryColor);
     setIfPresent('--theme-secondary', settings.secondaryColor);
};

export const availableFonts = [
     { name: 'Candara', value: "var(--font-candara)" },
     { name: 'Open Sans', value: "var(--font-open-sans)" },
     { name: 'Segoe UI', value: "var(--font-segoe)" },
     { name: 'Raleway', value: "var(--font-raleway)" },
];

export const normalizeFontFamily = (fontValue: unknown): string => {
     if (typeof fontValue !== 'string') return DEFAULT_FONT_FAMILY;

     const value = fontValue.trim();
     const fontName = value.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
     return availableFonts.find((font) =>
          font.value === value || font.name.toLowerCase() === fontName
     )?.value || DEFAULT_FONT_FAMILY;
};

export const availableSidebarStyles = [
     { id: 'modern', name: 'Modern', description: 'Clean and flat with subtle shadows' }
];

export const availableFontSizes = [
     { name: 'Extra Small', value: '12px' },
     { name: 'Small', value: '13px' },
     { name: 'Medium Small', value: '14px' },
     { name: 'Medium', value: '15px' },
     { name: 'Medium Large', value: '16px' },
     { name: 'Large', value: '17px' },
     { name: 'Extra Large', value: '18px' },
     { name: 'XX Large', value: '19px' },
     { name: 'XXX Large', value: '20px' },
     { name: 'Huge', value: '21px' },
     { name: 'Extra Huge', value: '22px' },
     { name: 'Massive', value: '24px' }
];

export const availableTableThemes = [
     { id: 'PrimeLaboratoryTableStyling', name: 'Prime Laboratory', description: 'Original system styling' }
];

export const saveFontPreference = (fontValue: string) => {
     if (typeof window !== 'undefined') {
          localStorage.setItem('lobnos-font-preference', fontValue);
     }
};

export const getFontPreference = (): string => {
     if (typeof window !== 'undefined') {
          return normalizeFontFamily(localStorage.getItem('lobnos-font-preference'));
     }
     return DEFAULT_FONT_FAMILY;
};

export const getFontSizePreference = (): string => {
     if (typeof window !== 'undefined') {
          return localStorage.getItem('lobnos-font-size-preference') || '15px';
     }
     return '15px';
};

export const saveFontSizePreference = (fontSizeValue: string) => {
     if (typeof window !== 'undefined') {
          localStorage.setItem('lobnos-font-size-preference', fontSizeValue);
     }
};

export const applyFontSizeToDocument = (fontSizeValue: string) => {
     if (typeof document === 'undefined') return;

     const root = document.documentElement;
     root.style.setProperty('--theme-font-size', fontSizeValue);
};

export const applyFontToDocument = (fontValue: string) => {
     if (typeof document === 'undefined') return;

     const root = document.documentElement;
     root.style.setProperty('--theme-font-family', normalizeFontFamily(fontValue));
};

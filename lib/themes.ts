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
     typography: {
          fontFamily: string;
     };
}

export const themes: Theme[] = [
     {
          id: 'professional-green',
          name: 'Professional Green',
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
               sidebarWidth: '280px',
               borderRadius: '8px',
               sidebarStyle: 'modern'
          },
          typography: {
               fontFamily: "'Inter', sans-serif"
          }
     },
     {
          id: 'corporate-blue',
          name: 'Corporate Blue',
          colors: {
               sidebarBg: '#2c3e50',
               sidebarText: '#ecf0f1',
               sidebarHover: '#34495e',
               sidebarActive: '#3498db',
               sidebarBorder: 'transparent',
               headerBg: '#ffffff',
               headerText: '#2c3e50',
               headerBorder: '#dfe6e9',
               accent: '#3498db',
               bodyBg: '#f4f6f7',
               cardBg: '#ffffff'
          },
          layout: {
               sidebarWidth: '260px',
               borderRadius: '4px',
               sidebarStyle: 'classic'
          },
          typography: {
               fontFamily: "'Roboto', sans-serif"
          }
     },
     {
          id: 'modern-purple',
          name: 'Modern Purple',
          colors: {
               sidebarBg: '#ffffff',
               sidebarText: '#636e72',
               sidebarHover: '#f0f3f7',
               sidebarActive: '#e0e6ed',
               sidebarBorder: '#dfe6e9',
               headerBg: '#ffffff',
               headerText: '#2d3436',
               headerBorder: 'transparent',
               accent: '#6c5ce7',
               bodyBg: '#f9f9f9',
               cardBg: '#ffffff'
          },
          layout: {
               sidebarWidth: '270px',
               borderRadius: '12px',
               sidebarStyle: 'minimal'
          },
          typography: {
               fontFamily: "'Poppins', sans-serif"
          }
     },
     {
          id: 'executive-dark',
          name: 'Executive Dark',
          colors: {
               sidebarBg: 'rgba(26, 26, 46, 0.85)',
               sidebarText: '#a0a0a0',
               sidebarHover: 'rgba(22, 33, 62, 0.8)',
               sidebarActive: 'rgba(15, 52, 96, 0.8)',
               sidebarBorder: 'rgba(22, 33, 62, 0.5)',
               headerBg: '#1a1a2e',
               headerText: '#ffffff',
               headerBorder: '#16213e',
               accent: '#e94560',
               bodyBg: '#0f0f1a',
               cardBg: '#16213e'
          },
          layout: {
               sidebarWidth: '290px',
               borderRadius: '0px',
               sidebarStyle: 'glass'
          },
          typography: {
               fontFamily: "'Montserrat', sans-serif"
          }
     },
     {
          id: 'classic-gray',
          name: 'Classic Gray',
          colors: {
               sidebarBg: '#f8f9fa',
               sidebarText: '#495057',
               sidebarHover: '#e9ecef',
               sidebarActive: '#dee2e6',
               sidebarBorder: '#dee2e6',
               headerBg: '#343a40',
               headerText: '#ffffff',
               headerBorder: 'transparent',
               accent: '#6c757d',
               bodyBg: '#e9ecef',
               cardBg: '#ffffff'
          },
          layout: {
               sidebarWidth: '250px',
               borderRadius: '6px',
               sidebarStyle: 'classic'
          },
          typography: {
               fontFamily: "'Open Sans', sans-serif"
          }
     }
];

export const getThemeById = (id: string): Theme => {
     return themes.find(t => t.id === id) || themes[0];
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

     // Typography - Only apply if no specific font preference is set
     const savedFont = typeof window !== 'undefined' ? localStorage.getItem('lobnos-font-preference') : null;
     if (!savedFont) {
          root.style.setProperty('--theme-font-family', theme.typography.fontFamily);
     }

     // Sidebar Style - Only apply if no specific sidebar preference is set
     const savedSidebar = typeof window !== 'undefined' ? localStorage.getItem('lobnos-sidebar-preference') : null;
     if (!savedSidebar) {
          root.setAttribute('data-sidebar-style', theme.layout.sidebarStyle);
     }
};

export const availableFonts = [
     { name: 'Inter', value: "'Inter', sans-serif" },
     { name: 'Roboto', value: "'Roboto', sans-serif" },
     { name: 'Open Sans', value: "'Open Sans', sans-serif" },
     { name: 'Lato', value: "'Lato', sans-serif" },
     { name: 'Montserrat', value: "'Montserrat', sans-serif" },
     { name: 'Poppins', value: "'Poppins', sans-serif" },
     { name: 'Source Sans 3', value: "'Source Sans 3', sans-serif" },
     { name: 'Nunito', value: "'Nunito', sans-serif" },
     { name: 'Raleway', value: "'Raleway', sans-serif" },
     { name: 'Ubuntu', value: "'Ubuntu', sans-serif" },
     { name: 'Playfair Display', value: "'Playfair Display', serif" },
     { name: 'Merriweather', value: "'Merriweather', serif" },
     { name: 'PT Sans', value: "'PT Sans', sans-serif" },
     { name: 'Oswald', value: "'Oswald', sans-serif" },
     { name: 'Work Sans', value: "'Work Sans', sans-serif" },
     { name: 'Quicksand', value: "'Quicksand', sans-serif" },
     { name: 'Dosis', value: "'Dosis', sans-serif" },
     { name: 'Oxygen', value: "'Oxygen', sans-serif" },
     { name: 'Fira Sans', value: "'Fira Sans', sans-serif" },
     { name: 'Barlow', value: "'Barlow', sans-serif" },
     { name: 'DM Sans', value: "'DM Sans', sans-serif" },
     { name: 'Manrope', value: "'Manrope', sans-serif" },
     { name: 'IBM Plex Sans', value: "'IBM Plex Sans', sans-serif" },
     { name: 'Crimson Text', value: "'Crimson Text', serif" },
     { name: 'Karla', value: "'Karla', sans-serif" }
];

export const saveFontPreference = (fontFamily: string) => {
     if (typeof window !== 'undefined') {
          localStorage.setItem('lobnos-font-preference', fontFamily);
     }
};

export const getFontPreference = (): string => {
     if (typeof window !== 'undefined') {
          return localStorage.getItem('lobnos-font-preference') || '';
     }
     return '';
};

export const applyFontToDocument = (fontFamily: string) => {
     if (typeof document === 'undefined' || !fontFamily) return;
     const root = document.documentElement;
     root.style.setProperty('--theme-font-family', fontFamily);
};

export const availableSidebarStyles = [
     { id: 'modern', name: 'Modern', description: 'Clean and flat with subtle shadows' },
     { id: 'classic', name: 'Classic', description: 'Traditional bordered structure' },
     { id: 'minimal', name: 'Minimal', description: 'Floating items with rounded corners' },
     { id: 'glass', name: 'Glass', description: 'Translucent with blur effect' },
     { id: 'material', name: 'Material', description: 'Card-like items with elevation' },
     { id: 'floating', name: 'Floating', description: 'Detached from screen edges' },
     { id: 'slim', name: 'Slim', description: 'Compact view with prominent icons' },
     { id: 'corporate', name: 'Corporate', description: 'Dense and structured with borders' },
     { id: 'futuristic', name: 'Futuristic', description: 'High-tech look with sharp angles' },
     { id: 'pill', name: 'Pill', description: 'Rounded pill-shaped active items' }
];

export const saveSidebarPreference = (styleId: string) => {
     if (typeof window !== 'undefined') {
          localStorage.setItem('lobnos-sidebar-preference', styleId);
     }
};

export const getSidebarPreference = (): string => {
     if (typeof window !== 'undefined') {
          return localStorage.getItem('lobnos-sidebar-preference') || '';
     }
     return '';
};

export const availableTableThemes = [
     { id: 'PrimeLaboratoryTableStyling', name: 'Prime Laboratory', description: 'Original system styling' },
     { id: 'modern', name: 'Modern', description: 'Clean, spacious, soft shadows' },
     { id: 'corporate', name: 'Corporate', description: 'Dense, bordered, high contrast' },
     { id: 'minimal', name: 'Minimal', description: 'No borders, just whitespace' },
     { id: 'grid', name: 'Grid', description: 'Heavy grid lines, spreadsheet style' },
     { id: 'elegant', name: 'Elegant', description: 'Serif fonts, sophisticated spacing' }
];

export const saveTableThemePreference = (themeId: string) => {
     if (typeof window !== 'undefined') {
          localStorage.setItem('lobnos-table-theme-preference', themeId);
     }
};

export const getTableThemePreference = (): string => {
     if (typeof window !== 'undefined') {
          return localStorage.getItem('lobnos-table-theme-preference') || 'PrimeLaboratoryTableStyling';
     }
     return 'PrimeLaboratoryTableStyling';
};

export const applyTableThemeToDocument = (themeId: string) => {
     if (typeof document === 'undefined' || !themeId) return;
     const root = document.documentElement;
     root.setAttribute('data-table-style', themeId);
};

export const availableLayoutStructures = [
     { id: 'header-top', name: 'Header Top', description: 'Header spans full width' },
     { id: 'sidebar-full', name: 'Sidebar Full', description: 'Sidebar spans full height' }
];

export const saveLayoutStructurePreference = (structureId: string) => {
     if (typeof window !== 'undefined') {
          localStorage.setItem('lobnos-layout-structure', structureId);
     }
};

export const getLayoutStructurePreference = (): string => {
     if (typeof window !== 'undefined') {
          return localStorage.getItem('lobnos-layout-structure') || 'header-top';
     }
     return 'header-top';
};

export const applyLayoutStructureToDocument = (structureId: string) => {
     if (typeof document === 'undefined' || !structureId) return;
     const root = document.documentElement;
     root.setAttribute('data-layout-structure', structureId);
};

export const applySidebarToDocument = (styleId: string) => {
     if (typeof document === 'undefined' || !styleId) return;
     const root = document.documentElement;
     root.setAttribute('data-sidebar-style', styleId);
};

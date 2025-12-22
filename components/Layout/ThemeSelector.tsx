'use client';
import React, { useState, useEffect } from 'react';
import {
     themes,
     Theme,
     saveThemePreference,
     applyThemeToDocument,
     availableFonts,
     saveFontPreference,
     applyFontToDocument,
     getFontPreference,
     availableSidebarStyles,
     saveSidebarPreference,
     applySidebarToDocument,
     getSidebarPreference,
     availableTableThemes,
     saveTableThemePreference,
     applyTableThemeToDocument,
     getTableThemePreference,
     availableLayoutStructures,
     saveLayoutStructurePreference,
     applyLayoutStructureToDocument,
     getLayoutStructurePreference
} from '../../lib/themes';
import styles from './ThemeSelector.module.css';
import { RiCloseLine, RiCheckLine } from '@remixicon/react';

interface ThemeSelectorProps {
     isOpen: boolean;
     onClose: () => void;
     currentThemeId: string;
     onThemeSelect: (themeId: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
     isOpen,
     onClose,
     currentThemeId,
     onThemeSelect
}) => {
     const [activeTab, setActiveTab] = useState<'themes' | 'fonts' | 'sidebar' | 'tables' | 'layout'>('themes');
     const [currentFont, setCurrentFont] = useState<string>('');
     const [currentSidebar, setCurrentSidebar] = useState<string>('');
     const [currentTableTheme, setCurrentTableTheme] = useState<string>('');
     const [currentLayout, setCurrentLayout] = useState<string>('');

     useEffect(() => {
          if (isOpen) {
               const savedFont = getFontPreference();
               setCurrentFont(savedFont || availableFonts[0].value);

               const savedSidebar = getSidebarPreference();
               // If no preference, we might want to get it from the current theme, 
               // but for now let's just default to 'modern' or empty if we want to show what's active
               setCurrentSidebar(savedSidebar || 'modern');

               const savedTableTheme = getTableThemePreference();
               setCurrentTableTheme(savedTableTheme || 'PrimeLaboratoryTableStyling');

               const savedLayout = getLayoutStructurePreference();
               setCurrentLayout(savedLayout || 'header-top');
          }
     }, [isOpen]);

     if (!isOpen) return null;

     const handleThemeSelect = (theme: Theme) => {
          saveThemePreference(theme.id);
          applyThemeToDocument(theme);
          onThemeSelect(theme.id);
     };

     const handleFontSelect = (fontValue: string) => {
          saveFontPreference(fontValue);
          applyFontToDocument(fontValue);
          setCurrentFont(fontValue);
     };

     const handleSidebarSelect = (styleId: string) => {
          saveSidebarPreference(styleId);
          applySidebarToDocument(styleId);
          setCurrentSidebar(styleId);
     };

     const handleTableThemeSelect = (themeId: string) => {
          saveTableThemePreference(themeId);
          applyTableThemeToDocument(themeId);
          setCurrentTableTheme(themeId);
     };

     const handleLayoutSelect = (structureId: string) => {
          saveLayoutStructurePreference(structureId);
          applyLayoutStructureToDocument(structureId);
          setCurrentLayout(structureId);
     };

     return (
          <div className={styles.modalOverlay} onClick={onClose}>
               <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                         <h3 className={styles.modalTitle}>Appearance Settings</h3>
                         <button className={styles.closeButton} onClick={onClose}>
                              <RiCloseLine size={24} />
                         </button>
                    </div>

                    <div className={styles.tabs}>
                         <button
                              className={`${styles.tab} ${activeTab === 'themes' ? styles.active : ''}`}
                              onClick={() => setActiveTab('themes')}
                         >
                              Themes
                         </button>
                         <button
                              className={`${styles.tab} ${activeTab === 'fonts' ? styles.active : ''}`}
                              onClick={() => setActiveTab('fonts')}
                         >
                              Typography
                         </button>
                         <button
                              className={`${styles.tab} ${activeTab === 'sidebar' ? styles.active : ''}`}
                              onClick={() => setActiveTab('sidebar')}
                         >
                              Sidebar
                         </button>
                         <button
                              className={`${styles.tab} ${activeTab === 'tables' ? styles.active : ''}`}
                              onClick={() => setActiveTab('tables')}
                         >
                              Tables
                         </button>
                         <button
                              className={`${styles.tab} ${activeTab === 'layout' ? styles.active : ''}`}
                              onClick={() => setActiveTab('layout')}
                         >
                              Layout
                         </button>
                    </div>

                    <div className={styles.modalBody}>
                         {activeTab === 'themes' ? (
                              <div className={styles.themeGrid}>
                                   {themes.map(theme => (
                                        <div
                                             key={theme.id}
                                             className={`${styles.themeCard} ${currentThemeId === theme.id ? styles.active : ''}`}
                                             onClick={() => handleThemeSelect(theme)}
                                        >
                                             <div className={styles.previewContainer}>
                                                  {/* Sidebar Preview */}
                                                  <div
                                                       className={styles.previewSidebar}
                                                       style={{
                                                            backgroundColor: theme.colors.sidebarBg,
                                                            borderRight: `1px solid ${theme.colors.sidebarBorder}`
                                                       }}
                                                  >
                                                       <div
                                                            className={styles.previewSidebarItem}
                                                            style={{ backgroundColor: theme.colors.sidebarText }}
                                                       />
                                                       <div
                                                            className={styles.previewSidebarItem}
                                                            style={{ backgroundColor: theme.colors.sidebarText, width: '60%' }}
                                                       />
                                                       <div
                                                            className={styles.previewSidebarItem}
                                                            style={{ backgroundColor: theme.colors.sidebarText, width: '70%' }}
                                                       />
                                                  </div>

                                                  {/* Content Preview */}
                                                  <div className={styles.previewContent} style={{ backgroundColor: theme.colors.bodyBg }}>
                                                       <div
                                                            className={styles.previewHeader}
                                                            style={{
                                                                 backgroundColor: theme.colors.headerBg,
                                                                 borderColor: theme.colors.headerBorder
                                                            }}
                                                       />
                                                       <div className={styles.previewBody}>
                                                            <div
                                                                 className={styles.previewCard}
                                                                 style={{ backgroundColor: theme.colors.cardBg }}
                                                            />
                                                       </div>
                                                  </div>
                                             </div>

                                             <div className={styles.themeInfo}>
                                                  <div className={styles.themeNameContainer}>
                                                       <span className={styles.themeName}>{theme.name}</span>
                                                       <span className={styles.themeFont} style={{ fontFamily: theme.typography.fontFamily }}>
                                                            {theme.typography.fontFamily.split(',')[0].replace(/['"]/g, '')}
                                                       </span>
                                                  </div>
                                                  {currentThemeId === theme.id && (
                                                       <RiCheckLine size={20} className={styles.activeIndicator} />
                                                  )}
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         ) : activeTab === 'fonts' ? (
                              <div className={styles.fontGrid}>
                                   {availableFonts.map((font) => (
                                        <div
                                             key={font.name}
                                             className={`${styles.fontCard} ${currentFont === font.value ? styles.active : ''}`}
                                             onClick={() => handleFontSelect(font.value)}
                                        >
                                             <div className={styles.fontPreview} style={{ fontFamily: font.value }}>
                                                  Aa
                                             </div>
                                             <div className={styles.fontName} style={{ fontFamily: font.value }}>
                                                  {font.name}
                                             </div>
                                             {currentFont === font.value && (
                                                  <RiCheckLine size={20} className={styles.activeIndicator} style={{ position: 'absolute', top: '10px', right: '10px' }} />
                                             )}
                                        </div>
                                   ))}
                              </div>
                         ) : activeTab === 'sidebar' ? (
                              <div className={styles.fontGrid}>
                                   {availableSidebarStyles.map((style) => (
                                        <div
                                             key={style.id}
                                             className={`${styles.fontCard} ${currentSidebar === style.id ? styles.active : ''}`}
                                             onClick={() => handleSidebarSelect(style.id)}
                                        >
                                             <div className={styles.fontPreview} style={{ fontSize: '1rem', fontWeight: 600 }}>
                                                  {style.name}
                                             </div>
                                             <div className={styles.fontName}>
                                                  {style.description}
                                             </div>
                                             {currentSidebar === style.id && (
                                                  <RiCheckLine size={20} className={styles.activeIndicator} style={{ position: 'absolute', top: '10px', right: '10px' }} />
                                             )}
                                        </div>
                                   ))}
                              </div>
                         ) : activeTab === 'tables' ? (
                              <div className={styles.fontGrid}>
                                   {availableTableThemes.map((theme) => (
                                        <div
                                             key={theme.id}
                                             className={`${styles.fontCard} ${currentTableTheme === theme.id ? styles.active : ''}`}
                                             onClick={() => handleTableThemeSelect(theme.id)}
                                        >
                                             <div className={styles.fontPreview} style={{ fontSize: '1rem', fontWeight: 600 }}>
                                                  {theme.name}
                                             </div>
                                             <div className={styles.fontName}>
                                                  {theme.description}
                                             </div>
                                             {currentTableTheme === theme.id && (
                                                  <RiCheckLine size={20} className={styles.activeIndicator} style={{ position: 'absolute', top: '10px', right: '10px' }} />
                                             )}
                                        </div>
                                   ))}
                              </div>
                         ) : (
                              <div className={styles.fontGrid}>
                                   {availableLayoutStructures.map((layout) => (
                                        <div
                                             key={layout.id}
                                             className={`${styles.fontCard} ${currentLayout === layout.id ? styles.active : ''}`}
                                             onClick={() => handleLayoutSelect(layout.id)}
                                        >
                                             <div className={styles.fontPreview} style={{ fontSize: '1rem', fontWeight: 600 }}>
                                                  {layout.name}
                                             </div>
                                             <div className={styles.fontName}>
                                                  {layout.description}
                                             </div>
                                             {currentLayout === layout.id && (
                                                  <RiCheckLine size={20} className={styles.activeIndicator} style={{ position: 'absolute', top: '10px', right: '10px' }} />
                                             )}
                                        </div>
                                   ))}
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
};

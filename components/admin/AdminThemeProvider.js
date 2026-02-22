/**
 * AdminThemeProvider
 * 
 * Injects CSS variables from admin.json theme config at runtime.
 * This allows changing the admin panel's entire color scheme by editing admin.json.
 * 
 * Usage: Wrap admin pages with this component in _app.js
 * 
 * The theme values from admin.json are converted to CSS variables:
 *   theme.colors.primary -> --admin-color-primary
 *   theme.button.primaryBg -> --admin-button-primary-bg
 *   etc.
 */

import { useEffect } from 'react';
import adminConfig from '../../config/admin.json';

// Generate CSS variables string from theme config
function generateCSSVariables(theme) {
  const vars = [];
  
  // Colors
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      vars.push(`--admin-color-${key}: ${value};`);
    });
  }
  
  // Text
  if (theme.text) {
    Object.entries(theme.text).forEach(([key, value]) => {
      vars.push(`--admin-text-${key}: ${value};`);
    });
  }
  
  // Sidebar
  if (theme.sidebar) {
    Object.entries(theme.sidebar).forEach(([key, value]) => {
      vars.push(`--admin-sidebar-${camelToKebab(key)}: ${value};`);
    });
  }
  
  // Table
  if (theme.table) {
    Object.entries(theme.table).forEach(([key, value]) => {
      vars.push(`--admin-table-${camelToKebab(key)}: ${value};`);
    });
  }
  
  // Button
  if (theme.button) {
    Object.entries(theme.button).forEach(([key, value]) => {
      vars.push(`--admin-button-${camelToKebab(key)}: ${value};`);
    });
  }
  
  // Input
  if (theme.input) {
    Object.entries(theme.input).forEach(([key, value]) => {
      vars.push(`--admin-input-${camelToKebab(key)}: ${value};`);
    });
  }
  
  // Modal
  if (theme.modal) {
    Object.entries(theme.modal).forEach(([key, value]) => {
      vars.push(`--admin-modal-${camelToKebab(key)}: ${value};`);
    });
  }
  
  return `:root {\n  ${vars.join('\n  ')}\n}`;
}

// Convert camelCase to kebab-case
function camelToKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export default function AdminThemeProvider({ children }) {
  useEffect(() => {
    const theme = adminConfig.admin?.theme;
    const fontsConfig = adminConfig.app?.fonts;
    
    // Inject Google Fonts
    if (fontsConfig?.googleFonts?.length > 0) {
      const existingFonts = document.getElementById('admin-google-fonts');
      if (existingFonts) existingFonts.remove();
      
      const fontUrl = `https://fonts.googleapis.com/css2?${fontsConfig.googleFonts.map(f => `family=${f}`).join('&')}&display=swap`;
      const link = document.createElement('link');
      link.id = 'admin-google-fonts';
      link.rel = 'stylesheet';
      link.href = fontUrl;
      document.head.appendChild(link);
    }
    
    // Check if style tag already exists
    const existingStyle = document.getElementById('admin-theme-vars');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Generate CSS with theme + fonts
    let cssVars = theme ? generateCSSVariables(theme) : ':root {}';
    
    // Add font variables
    if (fontsConfig) {
      const fontVars = `
        --admin-font-primary: '${fontsConfig.primary || 'Nunito'}', sans-serif;
        --admin-font-heading: '${fontsConfig.heading || 'Nunito'}', sans-serif;
      `;
      cssVars = cssVars.replace(':root {', `:root {\n  ${fontVars}`);
    }
    
    // Create and inject style tag
    const style = document.createElement('style');
    style.id = 'admin-theme-vars';
    style.textContent = cssVars;
    document.head.appendChild(style);
    
    return () => {
      const styleTag = document.getElementById('admin-theme-vars');
      if (styleTag) styleTag.remove();
      const fontLink = document.getElementById('admin-google-fonts');
      if (fontLink) fontLink.remove();
    };
  }, []);
  
  return children;
}

// Export theme getter for inline styles
export function getTheme() {
  return adminConfig.admin?.theme || {};
}

// Export individual theme sections for convenience
export const theme = adminConfig.admin?.theme || {};
export const colors = theme.colors || {};
export const text = theme.text || {};
export const sidebar = theme.sidebar || {};
export const table = theme.table || {};
export const button = theme.button || {};
export const input = theme.input || {};
export const modal = theme.modal || {};

// Export fonts config
export const fonts = adminConfig.app?.fonts || {
  primary: 'Nunito',
  heading: 'Nunito',
  googleFonts: ['Nunito:wght@400;600;700;800']
};

// Helper to convert hex to RGB values for rgba()
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '212, 175, 55'; // fallback
}

/**
 * Pre-built style objects for common UI elements
 * Import these and spread into your style prop
 */
export const styles = {
  // Page title
  pageTitle: {
    fontSize: '1.8rem',
    marginBottom: '20px',
    color: text.primary,
  },
  
  // Primary button (gold background)
  primaryButton: {
    padding: '10px 20px',
    background: button.primaryBg,
    color: button.primaryText,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  },
  
  // Secondary button (light background)
  secondaryButton: {
    padding: '10px 20px',
    background: button.secondaryBg,
    color: button.secondaryText,
    border: `1px solid ${button.secondaryBorder}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  
  // Small primary button
  smallPrimaryButton: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    background: button.primaryBg,
    color: button.primaryText,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  
  // Small secondary button
  smallSecondaryButton: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    background: button.secondaryBg,
    color: button.secondaryText,
    border: `1px solid ${button.secondaryBorder}`,
    borderRadius: '4px',
    cursor: 'pointer',
  },
  
  // Table header cell
  tableHeader: {
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: text.primary,
  },
  
  // Table cell
  tableCell: {
    padding: '12px',
    color: text.primary,
  },
  
  // Muted table cell (for IDs, etc.)
  tableCellMuted: {
    padding: '12px',
    color: text.secondary,
  },
  
  // Price/accent text
  accentText: {
    fontWeight: 'bold',
    color: colors.secondary,
  },
  
  // Toggle badge (active state)
  toggleActive: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    background: colors.secondary,
    color: text.primary,
  },
  
  // Toggle badge (inactive state)
  toggleInactive: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    background: '#ccc',
    color: text.primary,
  },
  
  // Code block
  codeBlock: {
    background: colors.primary,
    color: colors.secondary,
    padding: '15px',
    borderRadius: '8px',
    overflowX: 'auto',
    fontSize: '0.85rem',
  },
  
  // Section header
  sectionHeader: {
    fontSize: '1.8rem',
    margin: 0,
    color: text.primary,
    flex: 1,
    minWidth: '150px',
  },
  
  // Dropdown
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: modal.background,
    border: `1px solid ${table.border}`,
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 100,
    minWidth: '200px',
  },
  
  // Checkbox label
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 0',
    cursor: 'pointer',
    color: text.primary,
  },
};

// Hover handlers for primary buttons
export const primaryButtonHover = {
  onMouseEnter: (e) => {
    e.target.style.background = button.primaryHover;
  },
  onMouseLeave: (e) => {
    e.target.style.background = button.primaryBg;
  },
};

// Hover handlers for secondary buttons
export const secondaryButtonHover = {
  onMouseEnter: (e) => {
    e.target.style.background = '#eee';
  },
  onMouseLeave: (e) => {
    e.target.style.background = button.secondaryBg;
  },
};

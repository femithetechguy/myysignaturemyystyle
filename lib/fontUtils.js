// Utility function to get font class names statically
export function getFontClass(fontName) {
  const fontMap = {
    nunito: 'font-nunito',
    playfair: 'font-playfair',
    inter: 'font-inter',
    lato: 'font-lato',
    trebuchet: 'font-trebuchet',
  };
  return fontMap[fontName?.toLowerCase()] || 'font-trebuchet';
}

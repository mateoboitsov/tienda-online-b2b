// Constantes de colores compartidas entre componentes y panel de administración
export const PRODUCT_COLORS = {
  // Colores básicos (Spanish & English)
  'Negro': 'bg-black',
  'Black': 'bg-black',
  'Blanco': 'bg-white border border-gray-300',
  'White': 'bg-white border border-gray-300',
  'Azul': 'bg-blue-500',
  'Blue': 'bg-blue-500',
  'Rosa': 'bg-pink-400',
  'Pink': 'bg-[#fbd3d9]',
  'Amarillo': 'bg-yellow-400',
  'Yellow': 'bg-yellow-400',
  'Verde': 'bg-green-500',
  'Green': 'bg-green-500',
  'Rojo': 'bg-red-600',
  'Red': 'bg-red-600',
  '(PRODUCT)RED': 'bg-[#e31a31]',
  'Púrpura': 'bg-purple-500',
  'Purple': 'bg-purple-500',
  'Oro': 'bg-[#f5e1c0]',
  'Gold': 'bg-[#f5e1c0]',
  'Plata': 'bg-[#e3e4e5]',
  'Silver': 'bg-[#e3e4e5]',

  // iPhone 17 & Future
  'Cosmic Orange': 'bg-[#ff8c00]',
  'Dark Blue': 'bg-[#1b2b44]',
  'Mist Blue': 'bg-[#a9c9d9]',
  'Sage Green': 'bg-[#a6b1a1]',
  'Lavender': 'bg-[#e6e6fa]',
  'Sky Blue': 'bg-[#87ceeb]',
  'Cloud White': 'bg-[#f5f5f7]',
  'Light Gold': 'bg-[#f5e1c0]',

  // iPhone 16
  'Desert Titanium': 'bg-[#d4c5b3]',
  'Teal': 'bg-[#a2d2d1]',
  'Ultramarine': 'bg-[#4e67c8]',

  // Colores Especiales & Titanio
  'Grafito': 'bg-[#4b4b4d]',
  'Graphite': 'bg-[#4b4b4d]',
  'Medianoche': 'bg-[#191970]',
  'Midnight': 'bg-[#191970]',
  'Estelar': 'bg-[#faf0e6]',
  'Starlight': 'bg-[#faf0e6]',
  'Space Black': 'bg-[#1d1d1f]',
  'Titanio Natural': 'bg-[#bcbcad]',
  'Natural Titanium': 'bg-[#bcbcad]',
  'Titanio Azul': 'bg-[#3a4454]',
  'Blue Titanium': 'bg-[#3a4454]',
  'Titanio Blanco': 'bg-[#f2f2f2]',
  'White Titanium': 'bg-[#f2f2f2]',
  'Titanio Negro': 'bg-[#3b3b3c]',
  'Black Titanium': 'bg-[#3b3b3c]',

  // Colores Pro Pasados
  'Verde Sierra': 'bg-[#a7c1d1]',
  'Sierra Blue': 'bg-[#a7c1d1]',
  'Verde Alpino': 'bg-[#4f5c4f]',
  'Alpine Green': 'bg-[#4f5c4f]',
  'Azul Pacífico': 'bg-[#314f5a]',
  'Pacific Blue': 'bg-[#314f5a]',
  'Deep Purple': 'bg-[#675471]',

  'N/A': 'bg-transparent border border-dashed border-gray-300',
} as const;

// Lista extendida de todos los colores
export const ALL_COLORS = Object.keys(PRODUCT_COLORS).filter(k => k !== 'N/A');

// Lista de colores disponibles para productos nuevos
export const NEW_PRODUCT_COLORS = ["N/A", ...ALL_COLORS] as const;

// Lista de colores disponibles para productos usados/reacondicionados
export const USED_PRODUCT_COLORS = ["N/A", ...ALL_COLORS] as const;

// Función helper para obtener el color CSS
export const getColorSwatch = (color: string): string => {
  return PRODUCT_COLORS[color as keyof typeof PRODUCT_COLORS] || 'bg-gray-200';
};

// Función para obtener colores disponibles según tipo de producto
export const getAvailableColors = (productType: string): string[] => {
  return [...NEW_PRODUCT_COLORS];
};

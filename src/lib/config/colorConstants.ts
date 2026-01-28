// Constantes de colores compartidas entre componentes y panel de administración
export const PRODUCT_COLORS = {
  // Colores básicos
  'Negro': 'bg-black',
  'Blanco': 'bg-white border border-gray-300',
  'Azul': 'bg-blue-500',
  'Rosa': 'bg-pink-400',
  'Amarillo': 'bg-yellow-500',
  'Verde': 'bg-green-500',
  'Rojo': 'bg-red-500',
  'Púrpura': 'bg-purple-500',
  'Oro': 'bg-yellow-600',
  'Plata': 'bg-gray-400',
  
  // Colores especiales
  'Grafito': 'bg-gray-700',
  'Medianoche': 'bg-gray-900',
  'Estelar': 'bg-gray-300',
  
  // Colores Titanio
  'Titanio Natural': 'bg-stone-300',
  'Titanio Azul': 'bg-blue-300',
  'Titanio Blanco': 'bg-gray-100',
  'Titanio Negro': 'bg-gray-800',
  
  // Colores Sierra
  'Verde Sierra': 'bg-green-600',
  'Azul Sierra': 'bg-blue-600',
  'Azul Pacífico': 'bg-blue-400',
} as const;

// Lista de colores disponibles para productos nuevos
export const NEW_PRODUCT_COLORS = [
  "Negro", "Blanco", "Azul", "Rosa", "Amarillo", "Verde", "Rojo", "Púrpura", 
  "Oro", "Plata", "Grafito", "Medianoche", "Estelar", "Titanio Natural", 
  "Titanio Azul", "Titanio Blanco", "Titanio Negro", "Verde Sierra", 
  "Azul Sierra", "Azul Pacífico"
] as const;

// Lista de colores disponibles para productos usados/reacondicionados
export const USED_PRODUCT_COLORS = [
  "Negro", "Blanco", "Azul", "Rosa", "Amarillo", "Verde", "Rojo", "Púrpura", 
  "Oro", "Plata", "Grafito", "Medianoche", "Estelar"
] as const;

// Función helper para obtener el color CSS
export const getColorSwatch = (color: string): string => {
  return PRODUCT_COLORS[color as keyof typeof PRODUCT_COLORS] || 'bg-gray-200';
};

// Función para obtener colores disponibles según tipo de producto
export const getAvailableColors = (productType: string): string[] => {
  if (productType === 'NUEVO') {
    return [...NEW_PRODUCT_COLORS];
  } else {
    return [...USED_PRODUCT_COLORS];
  }
};

// Configuración de imágenes para productos
export const productImageConfig = {
  // Imágenes por defecto para cada categoría
  categoryDefaults: {
    "Smartphones": [
      "/moviles.png"
    ],
    "Laptops": [
      "/portatiles.png"
    ],
    "Tablets": [
      "/tablets.png"
    ],
    "Smartwatches": [
      "/watch.png"
    ],
    "Accessories": [
      "/otros.png"
    ]
  },
  
  // Imágenes de placeholder por defecto
  placeholders: {
    smartphone: "/moviles.png",
    laptop: "/portatiles.png",
    tablet: "/tablets.png",
    watch: "/watch.png",
    accessory: "/otros.png"
  },
  
  // Función para obtener imágenes por categoría
  getImagesByCategory: (category: string, customImages?: string[]) => {
    if (customImages && customImages.length > 0) {
      return customImages;
    }
    
    // Normalizar la categoría para un mejor mapeo
    const categoryLower = category.toLowerCase();
    let mappedCategory = '';
    
    if (categoryLower.includes('smartphone') || categoryLower.includes('phone') || categoryLower.includes('móvil')) {
      mappedCategory = 'Smartphones';
    } else if (categoryLower.includes('laptop') || categoryLower.includes('portatil') || categoryLower.includes('notebook')) {
      mappedCategory = 'Laptops';
    } else if (categoryLower.includes('tablet') || categoryLower.includes('ipad')) {
      mappedCategory = 'Tablets';
    } else if (categoryLower.includes('watch') || categoryLower.includes('reloj')) {
      mappedCategory = 'Smartwatches';
    } else {
      mappedCategory = 'Accessories';
    }
    
    const defaultImages = productImageConfig.categoryDefaults[mappedCategory as keyof typeof productImageConfig.categoryDefaults];
    return defaultImages || [productImageConfig.placeholders.accessory];
  },
  
  // Función para validar si una imagen existe
  validateImage: (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }
};



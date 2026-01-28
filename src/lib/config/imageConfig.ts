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

  // Función para obtener imagen automática según el nombre del modelo
  getAutomaticImage: (model: string): string => {
    const modelLower = model.toLowerCase();

    // Mapeo manual basado en los archivos disponibles en public/iphones
    if (modelLower.includes('iphone 16 pro max')) return '/iphones/iphone-16-pro-max-colors.png';
    if (modelLower.includes('iphone 16 pro')) return '/iphones/iphone-16-pro-colors.png';
    if (modelLower.includes('iphone 16 plus')) return '/iphones/iphone-16-plus-colors.png';
    if (modelLower.includes('iphone 16e')) return '/iphones/iphone-16e-colors.png';
    if (modelLower.includes('iphone 16')) return '/iphones/iphone-16-colors.png';

    if (modelLower.includes('iphone 15 pro max')) return '/iphones/fall-2023-iphone-colors-iphone-15-pro-max.png';
    if (modelLower.includes('iphone 15 pro')) return '/iphones/fall-2023-iphone-colors-iphone-15-pro.png';
    if (modelLower.includes('iphone 15 plus')) return '/iphones/fall-2023-iphone-colors-iphone-15-plus.png';
    if (modelLower.includes('iphone 15')) return '/iphones/fall-2023-iphone-colors-iphone-15.png';

    if (modelLower.includes('iphone 14 pro max')) return '/iphones/iphone-14-pro-max-colors.png';
    if (modelLower.includes('iphone 14 pro')) return '/iphones/iphone-14-pro-colors.png';
    if (modelLower.includes('iphone 14 plus')) return '/iphones/iphone-14-plus-colors-spring-2023.png';
    if (modelLower.includes('iphone 14')) return '/iphones/iphone-14-colors-spring-2023.png';

    if (modelLower.includes('iphone 13 pro max')) return '/iphones/2022-spring-iphone13-pro-max-colors.png';
    if (modelLower.includes('iphone 13 pro')) return '/iphones/2022-spring-iphone13-pro-colors.png';
    if (modelLower.includes('iphone 13 mini')) return '/iphones/2022-iphone13-mini-colors.png';
    if (modelLower.includes('iphone 13')) return '/iphones/2022-spring-iphone13-colors.png';

    if (modelLower.includes('iphone 12 pro max')) return '/iphones/iphone12-pro-max-colors.jpg';
    if (modelLower.includes('iphone 12 pro')) return '/iphones/iphone12-pro-colors.jpg';
    if (modelLower.includes('iphone 12 mini')) return '/iphones/2021-iphone12-mini-colors.png';
    if (modelLower.includes('iphone 12')) return '/iphones/2021-iphone12-colors.png';

    if (modelLower.includes('iphone se')) return '/iphones/iphone-se-3rd-gen-colors.png';
    if (modelLower.includes('iphone air')) return '/iphones/iphone-air-colors.png';

    // Modelos futuros
    if (modelLower.includes('iphone 17 pro max')) return '/iphones/iphone-17-pro-max-colors.png';
    if (modelLower.includes('iphone 17 pro')) return '/iphones/iphone-17-pro-colors.png';
    if (modelLower.includes('iphone 17')) return '/iphones/iphone-17-colors.png';

    return ''; // Sin imagen automática específica
  },

  // Función para obtener imágenes por categoría
  getImagesByCategory: (category: string, productName?: string, customImages?: string[]) => {
    if (customImages && customImages.length > 0) {
      return customImages;
    }

    // Si es un iPhone, intentar obtener su imagen específica
    if (productName && productName.toLowerCase().includes('iphone')) {
      const autoImage = productImageConfig.getAutomaticImage(productName);
      if (autoImage) return [autoImage];
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
      if (!src) return resolve(false);
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }
};



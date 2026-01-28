// Mapeo detallado de colores por modelo de iPhone
export const IPHONE_MODEL_COLORS: { [key: string]: string[] } = {
    "iPhone 17 Pro Max": ["Silver", "Cosmic Orange", "Dark Blue"],
    "iPhone 17 Pro": ["Silver", "Cosmic Orange", "Dark Blue"],
    "iPhone 17": ["Black", "White", "Mist Blue", "Sage Green", "Lavender"],
    "iPhone Air": ["Space Black", "Cloud White", "Light Gold", "Sky Blue"],
    "iPhone 16e": ["Black", "White"],
    "iPhone 16 Pro Max": ["Black Titanium", "White Titanium", "Natural Titanium", "Desert Titanium"],
    "iPhone 16 Pro": ["Black Titanium", "White Titanium", "Natural Titanium", "Desert Titanium"],
    "iPhone 16 Plus": ["Black", "White", "Pink", "Teal", "Ultramarine"],
    "iPhone 16": ["Black", "White", "Pink", "Teal", "Ultramarine"],
    "iPhone 15 Pro Max": ["Black Titanium", "White Titanium", "Blue Titanium", "Natural Titanium"],
    "iPhone 15 Pro": ["Black Titanium", "White Titanium", "Blue Titanium", "Natural Titanium"],
    "iPhone 15 Plus": ["Black", "Blue", "Green", "Yellow", "Pink"],
    "iPhone 15": ["Black", "Blue", "Green", "Yellow", "Pink"],
    "iPhone 14 Pro Max": ["Silver", "Gold", "Space Black", "Deep Purple"],
    "iPhone 14 Pro": ["Silver", "Gold", "Space Black", "Deep Purple"],
    "iPhone 14 Plus": ["Midnight", "Starlight", "(PRODUCT)RED", "Blue", "Purple", "Yellow"],
    "iPhone 14": ["Midnight", "Starlight", "(PRODUCT)RED", "Blue", "Purple", "Yellow"],
    "iPhone SE (3rd gen)": ["(PRODUCT)RED", "Starlight", "Midnight"],
    "iPhone 13 Pro Max": ["Graphite", "Gold", "Silver", "Sierra Blue", "Alpine Green"],
    "iPhone 13 Pro": ["Graphite", "Gold", "Silver", "Sierra Blue", "Alpine Green"],
    "iPhone 13": ["(PRODUCT)RED", "Starlight", "Midnight", "Blue", "Pink", "Green"],
    "iPhone 13 mini": ["(PRODUCT)RED", "Starlight", "Midnight", "Blue", "Pink", "Green"],
    "iPhone 12 Pro Max": ["Silver", "Graphite", "Gold", "Pacific Blue"],
    "iPhone 12 Pro": ["Silver", "Graphite", "Gold", "Pacific Blue"],
    "iPhone 12": ["Black", "White", "(PRODUCT)RED", "Green", "Blue", "Purple"],
    "iPhone 12 mini": ["Black", "White", "(PRODUCT)RED", "Green", "Blue", "Purple"]
};

// Función para obtener los colores sugeridos para un modelo específico
export const getColorsByModel = (modelName: string): string[] => {
    // Intentar encontrar coincidencia exacta o parcial
    const modelKey = Object.keys(IPHONE_MODEL_COLORS).find(key =>
        modelName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(modelName.toLowerCase())
    );

    return modelKey ? IPHONE_MODEL_COLORS[modelKey] : [];
};

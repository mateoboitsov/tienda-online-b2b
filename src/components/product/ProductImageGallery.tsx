"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, X, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { productImageConfig } from "@/lib/config/imageConfig";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  category?: string;
  isInStock?: boolean;
  stock?: number;
}

// Función helper para obtener placeholder por categoría
const getCategoryPlaceholder = (category?: string): string => {
  if (!category) return productImageConfig.placeholders.smartphone;

  const categoryLower = category.toLowerCase();

  if (categoryLower.includes('smartphone') || categoryLower.includes('phone') || categoryLower.includes('móvil')) {
    return productImageConfig.placeholders.smartphone;
  } else if (categoryLower.includes('laptop') || categoryLower.includes('portatil') || categoryLower.includes('notebook')) {
    return productImageConfig.placeholders.laptop;
  } else if (categoryLower.includes('tablet') || categoryLower.includes('ipad')) {
    return productImageConfig.placeholders.tablet;
  } else if (categoryLower.includes('watch') || categoryLower.includes('reloj')) {
    return productImageConfig.placeholders.watch;
  } else {
    return productImageConfig.placeholders.accessory;
  }
};

export function ProductImageGallery({ images, productName, category, isInStock = true, stock = 0 }: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [validImages, setValidImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const closeZoom = () => {
    setIsZoomed(false);
  };

  // Procesar y validar imágenes
  useEffect(() => {
    const processImages = async () => {
      setIsLoading(true);

      // Si no hay imágenes personalizadas, usar imágenes por defecto de la categoría
      let imageList = images || [];

      if (imageList.length === 0) {
        // Usar imágenes por defecto basadas en la categoría y nombre del producto
        console.log(`🖼️ Cargando imágenes por defecto para: "${productName}" (${category || 'Smartphones'})`);
        imageList = productImageConfig.getImagesByCategory(category || 'Smartphones', productName);
        console.log(`🖼️ Imágenes seleccionadas:`, imageList);
      } else {
        console.log(`🖼️ Usando imágenes personalizadas:`, imageList);
      }

      // Validar cada imagen
      const validatedImages: string[] = [];
      for (const img of imageList) {
        try {
          const isValid = await productImageConfig.validateImage(img);
          if (isValid) {
            validatedImages.push(img);
          }
        } catch {
          // Si falla la validación, usar placeholder
          continue;
        }
      }

      // Si no hay imágenes válidas, usar placeholder basado en la categoría
      if (validatedImages.length === 0) {
        const categoryPlaceholder = getCategoryPlaceholder(category);
        validatedImages.push(categoryPlaceholder);
      }

      setValidImages(validatedImages);
      setIsLoading(false);
    };

    processImages();
  }, [images, category, productName]);

  // Si no hay imágenes, mostrar placeholder
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 flex items-center justify-center min-h-[500px] border border-gray-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-6"></div>
            <p className="text-gray-500">Cargando imágenes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!validImages || validImages.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 flex items-center justify-center min-h-[500px] border border-gray-200">
          <div className="text-center">
            <div className="w-40 h-40 bg-brand-green/10 rounded-full flex items-center justify-center mb-6 mx-auto">
              <span className="text-brand-green text-6xl font-bold">
                {productName.charAt(0)}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-brand-black mb-2">{productName}</h2>
            <p className="text-gray-500">Imágenes no disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Imagen principal */}
      <div className="relative group">
        <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 min-h-[500px] flex items-center justify-center relative">
          {/* Badge de stock - position absolute */}
          <Badge
            variant={isInStock ? "default" : "secondary"}
            className={`absolute top-4 left-4 z-10 text-base px-4 py-2 ${isInStock
              ? "bg-brand-green text-white"
              : "bg-gray-200 text-gray-600"
              }`}
          >
            {isInStock ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            {isInStock ? `En Stock (${stock})` : "Agotado"}
          </Badge>
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={validImages[currentImageIndex]}
              alt={`${productName} - Imagen ${currentImageIndex + 1}`}
              className={`w-full h-full object-contain transition-all duration-500 ease-in-out ${isZoomed ? 'scale-110' : 'scale-100'
                }`}
              key={currentImageIndex}
              onError={(e) => {
                // Fallback a placeholder si la imagen falla
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="text-center">
                      <div class="w-40 h-40 bg-brand-green/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <span class="text-brand-green text-6xl font-bold">${productName.charAt(0)}</span>
                      </div>
                      <h2 class="text-3xl font-bold text-brand-black mb-2">${productName}</h2>
                      <p class="text-gray-500">Imagen no disponible</p>
                      <div class="mt-4">
                        <ImageIcon class="w-8 h-8 text-gray-400 mx-auto" />
                      </div>
                    </div>
                  `;
                }
              }}
            />
          </div>

          {/* Botón de zoom */}
          <Button
            onClick={toggleZoom}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/80 hover:bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
        </div>

        {/* Navegación con flechas */}
        {validImages.length > 1 && (
          <>
            <Button
              onClick={previousImage}
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              onClick={nextImage}
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Indicador de imagen actual */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {currentImageIndex + 1} / {validImages.length}
          </div>
        )}

        {/* Indicador de progreso */}
        {validImages.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-green transition-all duration-300"
              style={{ width: `${((currentImageIndex + 1) / validImages.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {validImages.length > 1 && (
        <div className="flex gap-3 justify-center">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${index === currentImageIndex
                ? 'border-brand-green ring-2 ring-brand-green/20'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <img
                src={image}
                alt={`${productName} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback para miniaturas
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                        <ImageIcon class="w-6 h-6 text-gray-400" />
                      </div>
                    `;
                  }
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal de zoom */}
      {isZoomed && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={validImages[currentImageIndex]}
              alt={`${productName} - Zoom`}
              className="w-full h-full object-contain max-h-[90vh]"
            />

            {/* Botón de cerrar */}
            <Button
              onClick={closeZoom}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navegación en zoom */}
            {validImages.length > 1 && (
              <>
                <Button
                  onClick={previousImage}
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                  onClick={nextImage}
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Indicador en zoom */}
            {validImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-lg backdrop-blur-sm">
                {currentImageIndex + 1} / {validImages.length}
              </div>
            )}

            {/* Indicador de progreso en zoom */}
            {validImages.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${((currentImageIndex + 1) / validImages.length) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

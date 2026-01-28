"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types/database";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Plus, Minus, HardDrive, Palette, Star, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getColorSwatch } from "@/lib/config/colorConstants";
import { productImageConfig } from "@/lib/config/imageConfig";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { dispatch } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Función helper para parsear storage a número
  const parseStorageToNumber = (storage: string): number => {
    const match = storage.match(/(\d+)(GB|TB)/i);
    if (!match) return 0;
    const value = parseInt(match[1]);
    const unit = match[2].toUpperCase();
    return unit === 'TB' ? value * 1024 : value;
  };

  // Seleccionar primera variación con stock, priorizando menor capacidad
  const getDefaultVariation = () => {
    // Filtrar variaciones con stock disponible
    const inStockVariations = product.variations.filter(v => v.stock > 0);

    if (inStockVariations.length > 0) {
      // Ordenar por capacidad (menor a mayor) y seleccionar la primera
      const sorted = inStockVariations.sort((a, b) =>
        parseStorageToNumber(a.storage) - parseStorageToNumber(b.storage)
      );
      return sorted[0];
    }

    // Si no hay stock, devolver la primera variación de menor capacidad
    const sorted = [...product.variations].sort((a, b) =>
      parseStorageToNumber(a.storage) - parseStorageToNumber(b.storage)
    );
    return sorted[0];
  };

  const firstVariation = getDefaultVariation();
  const [selectedVariationId, setSelectedVariationId] = useState(firstVariation.id);
  const selectedVariation = product.variations.find(v => v.id === selectedVariationId) || firstVariation;

  // Extraer opciones únicas de las variaciones
  const availableOptions = useMemo(() => {
    // Función helper para ordenar storages
    const sortStorages = (storages: string[]) => {
      return storages.sort((a, b) => {
        // Convertir a números para comparar (ej: "128GB" -> 128, "1TB" -> 1024)
        const parseStorage = (str: string) => {
          const match = str.match(/(\d+)(GB|TB)/i);
          if (!match) return 0;
          const value = parseInt(match[1]);
          const unit = match[2].toUpperCase();
          return unit === 'TB' ? value * 1024 : value;
        };
        return parseStorage(a) - parseStorage(b);
      });
    };

    return {
      storages: sortStorages([...new Set(product.variations.map(v => v.storage))]),
      colors: [...new Set(product.variations.map(v => v.color))],
      conditions: [...new Set(product.variations.map(v => v.condition))],
      productTypes: [...new Set(product.variations.map(v => v.productType))]
    };
  }, [product.variations]);

  // Precio y stock de la variación seleccionada
  const currentPrice = quantity >= 10 && selectedVariation.priceBulk
    ? selectedVariation.priceBulk + 5
    : selectedVariation.price + 5;
  const hasStock = selectedVariation.stock > 0;

  // Handlers - buscan y seleccionan la variación correspondiente
  const handleStorageChange = (newStorage: string) => {
    const newVariation = product.variations.find(v =>
      v.storage === newStorage && v.color === selectedVariation.color
    ) || product.variations.find(v => v.storage === newStorage);
    if (newVariation) setSelectedVariationId(newVariation.id);
  };

  const handleColorChange = (newColor: string) => {
    const newVariation = product.variations.find(v =>
      v.storage === selectedVariation.storage && v.color === newColor
    ) || product.variations.find(v => v.color === newColor);
    if (newVariation) setSelectedVariationId(newVariation.id);
  };

  const handleProductTypeChange = (newProductType: string) => {
    const newVariation = product.variations.find(v =>
      v.storage === selectedVariation.storage &&
      v.color === selectedVariation.color &&
      v.productType === newProductType
    );
    if (newVariation) setSelectedVariationId(newVariation.id);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingToCart(true);

    // Crear nombre descriptivo basado en accesorios
    let productName = product.name;
    if (product.accessories) {
      if (!product.accessories.caseWithCharger && product.accessories.screenProtector) {
        productName += ' (Sin caja, Protector de pantalla)';
      } else if (!product.accessories.caseWithCharger) {
        productName += ' (Sin caja)';
      } else if (product.accessories.screenProtector) {
        productName += ' (Protector de pantalla)';
      }
    }

    const configuredProduct = {
      ...product,
      name: productName,
      storage: selectedVariation.storage,
      color: selectedVariation.color,
      condition: selectedVariation.condition,
      productType: selectedVariation.productType,
      price: currentPrice
    };

    for (let i = 0; i < quantity; i++) {
      dispatch({ type: "ADD_ITEM", payload: configuredProduct });
    }

    // Efecto visual de 300ms
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 300);
  };

  const handleProductClick = () => {
    router.push(`/productos/${product.id}`);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'NUEVO': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'A+': return 'bg-green-100 text-green-800 border-green-200';
      case 'A': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'B': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };




  return (
    <div
      onClick={handleProductClick}
      className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-brand-neon/30 hover:shadow-lg hover:shadow-brand-neon/10 transition-all duration-200 cursor-pointer"
    >
      {/* Estado del producto */}
      <div className="mb-4 text-left">
        <Badge
          variant={hasStock ? "default" : "secondary"}
          className={`text-sm px-3 py-1 ${hasStock
            ? "bg-brand-green text-white"
            : "bg-gray-200 text-gray-600"
            }`}
        >
          {hasStock ? "En Stock" : "Agotado"}
        </Badge>
      </div>

      {/* Imagen del producto */}
      <div className="mb-4 bg-gray-50 rounded-xl overflow-hidden aspect-square flex items-center justify-center p-4">
        <img
          src={product.image || productImageConfig.getAutomaticImage(product.name) || productImageConfig.placeholders.smartphone}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Título */}
      <h3 className="text-lg font-semibold text-brand-black mb-3 group-hover:text-brand-green transition-colors text-left">
        {product.name}
      </h3>

      {/* Descripción */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 text-left">
        {product.description}
      </p>

      {/* Configuración del producto */}
      <div className="space-y-3 mb-4">
        {/* Storage */}
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-gray-500" />
          {availableOptions.storages.length > 1 ? (
            availableOptions.storages.length <= 6 ? (
              <div className="flex gap-2">
                {availableOptions.storages.map((storage) => (
                  <button
                    key={storage}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStorageChange(storage);
                    }}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 ${selectedVariation.storage === storage
                      ? 'bg-brand-green text-white ring-2 ring-brand-green/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    title={storage}
                  >
                    {storage.replace(/gb/gi, '')}
                  </button>
                ))}
              </div>
            ) : (
              <select
                value={selectedVariation.storage}
                onChange={(e) => handleStorageChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
              >
                {availableOptions.storages.map((storage) => (
                  <option key={storage} value={storage}>
                    {storage}
                  </option>
                ))}
              </select>
            )
          ) : (
            <span className="text-sm font-medium text-gray-700">{selectedVariation.storage}</span>
          )}
        </div>

        {/* Color */}
        {!(availableOptions.colors.length === 1 && availableOptions.colors[0] === 'N/A') && (
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-500" />
            {availableOptions.colors.length > 1 ? (
              <div className="flex gap-2">
                {availableOptions.colors.map((color) => (
                  <button
                    key={color}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleColorChange(color);
                    }}
                    className={`w-8 h-8 rounded-full transition-all duration-200 border-2 relative ${selectedVariation.color === color
                      ? 'border-brand-green scale-110 opacity-100 shadow-sm'
                      : 'border-white opacity-80 hover:opacity-100'
                      } ${getColorSwatch(color)}`}
                    title={color}
                  >
                    {selectedVariation.color === color && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-green rounded-full border-2 border-white flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{
                    backgroundColor: getColorSwatch(selectedVariation.color).replace('bg-', ''),
                    ...(selectedVariation.color === 'Negro' && { backgroundColor: '#000000' }),
                    ...(selectedVariation.color === 'Blanco' && { backgroundColor: '#ffffff' }),
                    // ... otros colores si es necesario, pero con el nombre al lado basta
                  }}
                />
                <span className="text-sm font-medium text-gray-700">{selectedVariation.color}</span>
              </div>
            )}
          </div>
        )}

        {/* Tipo de Producto */}
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-500" />
          {availableOptions.productTypes.length > 1 ? (
            <select
              value={selectedVariation.productType}
              onChange={(e) => handleProductTypeChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
            >
              {availableOptions.productTypes.map((productType) => (
                <option key={productType} value={productType}>
                  {productType === 'NUEVO' ? 'Nuevo' :
                    productType === 'CPO' ? 'CPO' :
                      productType === 'ASIS' ? 'Apple ASIS' :
                        productType === 'REACONDICIONADO' ? 'Reacond.' : productType}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm font-medium text-gray-700">
              {selectedVariation.productType === 'NUEVO' ? 'Nuevo' :
                selectedVariation.productType === 'CPO' ? 'Certified Pre-Owned (CPO)' :
                  selectedVariation.productType === 'ASIS' ? 'Apple ASIS' :
                    selectedVariation.productType === 'REACONDICIONADO' ? 'Reacondicionado' : selectedVariation.productType}
            </span>
          )}
        </div>

        {/* Condition */}
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-gray-500" />
          {availableOptions.conditions.length > 1 ? (
            <select
              value={selectedVariation.condition}
              onChange={(e) => {
                const newVariation = product.variations.find(v =>
                  v.storage === selectedVariation.storage &&
                  v.color === selectedVariation.color &&
                  v.condition === e.target.value
                );
                if (newVariation) setSelectedVariationId(newVariation.id);
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
            >
              {availableOptions.conditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          ) : (
            <Badge variant="outline" className={`text-xs ${getConditionColor(selectedVariation.condition)}`}>
              Estado {selectedVariation.condition}
            </Badge>
          )}
        </div>
      </div>

      {/* Precios */}
      <div className="mb-4 text-left space-y-1">
        <div className="flex flex-col">
          {selectedVariation.price === 0 || !selectedVariation.price ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-400">N/A</span>
              <span className="text-xs text-gray-500 font-medium">Precio a consultar</span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${quantity < 10 ? 'text-brand-black' : 'text-gray-400 line-through text-lg'}`}>
                  €{(selectedVariation.price + 5).toFixed(2)}
                </span>
                <span className="text-xs text-gray-500 font-medium">(&lt; 10 unid.)</span>
              </div>

              {selectedVariation.priceBulk && selectedVariation.priceBulk > 0 && (
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${quantity >= 10 ? 'text-brand-green' : 'text-gray-400 text-lg'}`}>
                    €{(selectedVariation.priceBulk + 5).toFixed(2)}
                  </span>
                  <span className="text-xs text-brand-green font-bold">(10+ unid. 🔥)</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Controles de cantidad y carrito */}
      <div className="space-y-3">
        {/* Selector de cantidad */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (quantity > 1) setQuantity(quantity - 1);
            }}
            disabled={quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>

          <Input
            type="number"
            min="1"
            max="99"
            value={quantity}
            onChange={(e) => {
              e.stopPropagation();
              const newQuantity = parseInt(e.target.value) || 1;
              if (newQuantity >= 1 && newQuantity <= 99) {
                setQuantity(newQuantity);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-16 h-8 text-center text-sm"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (quantity < 99) setQuantity(quantity + 1);
            }}
            disabled={quantity >= 99}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Botón de agregar al carrito */}
        <Button
          onClick={handleAddToCart}
          disabled={!hasStock}
          className={`w-full ${hasStock
            ? 'bg-brand-green hover:bg-brand-green/90 text-white'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
        >
          {isAddingToCart ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {hasStock ? 'Agregar al carrito' : 'Agotado'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

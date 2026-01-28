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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { dispatch } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Seleccionar primera variación por defecto
  const firstVariation = product.variations[0];
  const [selectedVariationId, setSelectedVariationId] = useState(firstVariation.id);
  const selectedVariation = product.variations.find(v => v.id === selectedVariationId) || firstVariation;

  // Extraer opciones únicas de las variaciones
  const availableOptions = useMemo(() => {
    return {
      storages: [...new Set(product.variations.map(v => v.storage))],
      colors: [...new Set(product.variations.map(v => v.color))],
      conditions: [...new Set(product.variations.map(v => v.condition))],
      productTypes: [...new Set(product.variations.map(v => v.productType))]
    };
  }, [product.variations]);

  // Precio y stock de la variación seleccionada
  const currentPrice = selectedVariation.price;
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
          className={`text-sm px-3 py-1 ${
            hasStock 
              ? "bg-brand-green text-white" 
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {hasStock ? "En Stock" : "Agotado"}
        </Badge>
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
        {availableOptions.storages.length > 1 && (
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-gray-500" />
            {availableOptions.storages.length <= 6 ? (
              // Mostrar como círculos si hay 6 o menos opciones
              <div className="flex gap-2">
                {availableOptions.storages.map((storage) => (
                  <button
                    key={storage}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStorageChange(storage);
                    }}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 ${
                      selectedVariation.storage === storage
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
              // Mostrar como dropdown si hay más de 4 opciones
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
            )}
          </div>
        )}

        {/* Color */}
        {availableOptions.colors.length > 1 && (
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-500" />
            {availableOptions.colors.length <= 6 ? (
              // Mostrar como círculos si hay 6 o menos opciones
              <div className="flex gap-2">
                {availableOptions.colors.map((color) => (
                  <button
                    key={color}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleColorChange(color);
                    }}
                    className={`w-8 h-8 rounded-full transition-all duration-200 border-2 relative ${
                      selectedVariation.color === color
                        ? 'border-brand-green scale-110 opacity-100'
                        : 'border-gray-200 hover:border-gray-300 opacity-50 hover:opacity-75'
                    }`}
                    title={color}
                    style={{
                      backgroundColor: getColorSwatch(color).replace('bg-', ''),
                      // Mapeo directo de colores para asegurar que se apliquen
                      ...(color === 'Negro' && { backgroundColor: '#000000' }),
                      ...(color === 'Blanco' && { backgroundColor: '#ffffff', border: '1px solid #d1d5db' }),
                      ...(color === 'Azul' && { backgroundColor: '#3b82f6' }),
                      ...(color === 'Rosa' && { backgroundColor: '#f472b6' }),
                      ...(color === 'Amarillo' && { backgroundColor: '#eab308' }),
                      ...(color === 'Verde' && { backgroundColor: '#10b981' }),
                      ...(color === 'Rojo' && { backgroundColor: '#ef4444' }),
                      ...(color === 'Púrpura' && { backgroundColor: '#8b5cf6' }),
                      ...(color === 'Oro' && { backgroundColor: '#d97706' }),
                      ...(color === 'Plata' && { backgroundColor: '#9ca3af' }),
                      ...(color === 'Natural' && { backgroundColor: '#d6d3d1' }),
                      ...(color === 'Grafito' && { backgroundColor: '#4b5563' }),
                      ...(color === 'Medianoche' && { backgroundColor: '#1f2937' }),
                      ...(color === 'Estelar' && { backgroundColor: '#d1d5db' }),
                      ...(color === 'Titanio Natural' && { backgroundColor: '#d6d3d1' }),
                      ...(color === 'Titanio Azul' && { backgroundColor: '#93c5fd' }),
                      ...(color === 'Titanio Blanco' && { backgroundColor: '#f3f4f6' }),
                      ...(color === 'Titanio Negro' && { backgroundColor: '#374151' }),
                      ...(color === 'Verde Sierra' && { backgroundColor: '#059669' }),
                      ...(color === 'Azul Sierra' && { backgroundColor: '#2563eb' }),
                      ...(color === 'Azul Pacífico' && { backgroundColor: '#60a5fa' }),
                    }}
                  >
                    {/* Indicador de selección */}
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
              // Mostrar como dropdown si hay más de 6 opciones
              <select
                value={selectedVariation.color}
                onChange={(e) => handleColorChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
              >
                {availableOptions.colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Tipo de Producto */}
        {availableOptions.productTypes.length > 1 && (
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500" />
            <select
              value={selectedVariation.productType}
              onChange={(e) => handleProductTypeChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
            >
              {availableOptions.productTypes.map((productType) => (
                <option key={productType} value={productType}>
                  {productType === 'NUEVO' ? 'Nuevo' : 
                   productType === 'CPO' ? 'CPO (Certified Pre-Owned)' : 
                   productType === 'ASIS' ? 'Apple ASIS' : 
                   productType === 'REACONDICIONADO' ? 'Reacond. Premium' : 'Usado 100% Original'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Condition */}
        {availableOptions.conditions.length > 1 && (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-500" />
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
          </div>
        )}
      </div>

      {/* Precio */}
      <div className="mb-4 text-left">
        <span className="text-2xl font-bold text-brand-black">
          €{currentPrice.toFixed(2)}
        </span>
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
          className={`w-full ${
            hasStock 
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

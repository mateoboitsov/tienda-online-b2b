"use client";

import { useState, useMemo, useEffect } from "react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types/database";
import { HardDrive, Palette, Star, Shield } from "lucide-react";
import { getColorSwatch } from "@/lib/config/colorConstants";

interface ProductConfiguratorProps {
  product: Product;
  onConfigChange: (config: { storage: string; color: string; condition: string; productType: string }) => void;
}

export function ProductConfigurator({ product, onConfigChange }: ProductConfiguratorProps) {
  // Seleccionar la primera variación por defecto
  const firstVariation = product.variations[0];
  const [selectedVariationId, setSelectedVariationId] = useState(firstVariation.id);

  // Encontrar la variación seleccionada
  const selectedVariation = product.variations.find(v => v.id === selectedVariationId) || firstVariation;

  // Extraer TODAS las opciones únicas (sin filtrar)
  const allOptions = useMemo(() => {
    const storages = [...new Set(product.variations.map(v => v.storage))];
    const colors = [...new Set(product.variations.map(v => v.color))];
    const conditions = [...new Set(product.variations.map(v => v.condition))];
    const productTypes = [...new Set(product.variations.map(v => v.productType))];
    return { storages, colors, conditions, productTypes };
  }, [product.variations]);

  // Opciones disponibles según selección actual
  const availableOptions = useMemo(() => {
    const availableColors = new Set(product.variations
      .filter(v => v.storage === selectedVariation.storage)
      .map(v => v.color));
    const matchingVariations = product.variations.filter(v =>
      v.storage === selectedVariation.storage && v.color === selectedVariation.color
    );
    const availableConditions = new Set(matchingVariations.map(v => v.condition));
    const availableProductTypes = new Set(matchingVariations.map(v => v.productType));

    return {
      colors: availableColors,
      conditions: availableConditions,
      productTypes: availableProductTypes
    };
  }, [product.variations, selectedVariation.storage, selectedVariation.color]);

  // Filtrar variaciones disponibles según storage y color seleccionados
  const availableVariations = useMemo(() => {
    return product.variations.filter(v =>
      v.storage === selectedVariation.storage &&
      v.color === selectedVariation.color
    );
  }, [product.variations, selectedVariation.storage, selectedVariation.color]);

  // Notificar cambios cuando cambia la variación seleccionada
  // Usar useRef para evitar llamadas innecesarias
  const prevVariationIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    // Solo notificar si la variación realmente cambió (por ID)
    if (prevVariationIdRef.current !== selectedVariation.id) {
      prevVariationIdRef.current = selectedVariation.id;
      onConfigChange({
        storage: selectedVariation.storage,
        color: selectedVariation.color,
        condition: selectedVariation.condition,
        productType: selectedVariation.productType
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariation.id]); // Solo depender del ID, no del objeto completo ni de onConfigChange

  // Handlers - siempre buscan una variación disponible, incluso si la opción no está disponible para la selección actual
  const handleStorageChange = (newStorage: string): void => {
    // Priorizar mantener el color actual si es posible
    const newVariation = product.variations.find(v =>
      v.storage === newStorage &&
      v.color === selectedVariation.color
    ) || product.variations.find(v => v.storage === newStorage);

    if (newVariation) {
      setSelectedVariationId(newVariation.id);
    }
  };

  const handleColorChange = (newColor: string): void => {
    // Priorizar mantener el storage actual si es posible
    const newVariation = product.variations.find(v =>
      v.storage === selectedVariation.storage &&
      v.color === newColor
    ) || product.variations.find(v => v.color === newColor);

    if (newVariation) {
      setSelectedVariationId(newVariation.id);
    }
  };

  const handleConditionChange = (condition: string): void => {
    // Buscar variación con mismo storage+color pero nueva condición
    // Si no existe, buscar cualquier variación con esa condición
    const newVariation = product.variations.find(v =>
      v.storage === selectedVariation.storage &&
      v.color === selectedVariation.color &&
      v.condition === condition
    ) || product.variations.find(v => v.condition === condition);

    if (newVariation) {
      setSelectedVariationId(newVariation.id);
    }
  };

  const handleProductTypeChange = (productType: string): void => {
    // Buscar variación con mismo storage+color pero nuevo tipo
    // Si no existe, buscar cualquier variación con ese tipo
    const newVariation = product.variations.find(v =>
      v.storage === selectedVariation.storage &&
      v.color === selectedVariation.color &&
      v.productType === productType
    ) || product.variations.find(v => v.productType === productType);

    if (newVariation) {
      setSelectedVariationId(newVariation.id);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'NUEVO': return 'border-emerald-500 text-emerald-700 bg-emerald-50';
      case 'A+': return 'border-green-500 text-green-700 bg-green-50';
      case 'A': return 'border-blue-500 text-blue-700 bg-blue-50';
      case 'B': return 'border-yellow-500 text-yellow-700 bg-yellow-50';
      default: return 'border-gray-300 text-gray-700 bg-gray-50';
    }
  };






  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-brand-black">Configurar producto</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Almacenamiento */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-brand-black">Memoria</span>
          </div>
          <div className="space-y-2">
            {allOptions.storages.map((storage) => (
              <div
                key={storage}
                onClick={() => handleStorageChange(storage)}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedVariation.storage === storage
                  ? 'bg-brand-green/10 border-brand-green text-brand-green'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
              >
                <span className="text-sm font-medium">{storage}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-brand-black">Color</span>
          </div>
          <div className="space-y-2">
            {allOptions.colors.map((color) => {
              const isAvailable = availableOptions.colors.has(color);
              const isSelected = selectedVariation.color === color;
              return (
                <div
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`p-3 rounded-lg transition-all border flex items-center gap-3 ${isSelected
                    ? 'bg-brand-green/10 border-brand-green text-brand-green cursor-pointer'
                    : isAvailable
                      ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700 cursor-pointer'
                      : 'bg-gray-50/50 border-gray-200/50 text-gray-400 opacity-40 cursor-pointer hover:opacity-60'
                    }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300 relative"
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
                  </div>
                  <span className="text-sm font-medium">{color}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tipo de Producto - Solo mostrar si hay tipos disponibles */}
        {allOptions.productTypes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-brand-black">Tipo</span>
            </div>
            <div className="space-y-2">
              {allOptions.productTypes.map((productType) => {
                const isAvailable = availableOptions.productTypes.has(productType);
                const isSelected = selectedVariation.productType === productType;
                return (
                  <div
                    key={productType}
                    onClick={() => handleProductTypeChange(productType)}
                    className={`p-3 rounded-lg transition-all border items-center gap-3 ${isSelected
                      ? 'bg-brand-green/10 border-brand-green text-brand-green cursor-pointer'
                      : isAvailable
                        ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700 cursor-pointer'
                        : 'bg-gray-50/50 border-gray-200/50 text-gray-400 opacity-40 cursor-pointer hover:opacity-60'
                      }`}
                  >

                    <span className="text-sm font-medium">
                      {productType === 'NUEVO' ? 'Nuevo' :
                        productType === 'CPO' ? 'CPO (Certified Pre-Owned)' :
                          productType === 'ASIS' ? 'Apple ASIS' :
                            productType === 'REACONDICIONADO' ? 'Reacond. Premium' : 'Usado 100% Original'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Estado */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-brand-black">Estado</span>
          </div>
          <div className="space-y-2">
            {availableVariations.map((variation) => (
              <div
                key={variation.id}
                onClick={() => setSelectedVariationId(variation.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedVariationId === variation.id
                  ? 'bg-brand-green/10 border-brand-green text-brand-green'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getConditionColor(variation.condition)}`}
                  >
                    {variation.condition}
                  </Badge>
                  <span className="text-sm font-medium">
                    €{variation.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


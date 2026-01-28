"use client";

import { useState, useMemo, useEffect } from "react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types/database";
import { HardDrive, Palette, Star, Shield } from "lucide-react";
import { getColorSwatch } from "@/lib/config/colorConstants";

interface ProductConfiguratorProps {
  product: Product;
  onConfigChange: (config: { storage: string; color: string; condition: string; productType: string; packaging: string | null }) => void;
}

export function ProductConfigurator({ product, onConfigChange }: ProductConfiguratorProps) {
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

  // Encontrar la variación seleccionada
  const selectedVariation = product.variations.find(v => v.id === selectedVariationId) || firstVariation;

  // Extraer TODAS las opciones únicas (sin filtrar)
  const allOptions = useMemo(() => {
    // Función helper para ordenar storages
    const sortStorages = (storages: string[]) => {
      return storages.sort((a, b) => {
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

    // Función helper para ordenar condiciones
    const sortConditions = (conditions: string[]) => {
      const priority: { [key: string]: number } = {
        'NUEVO': 1,
        'A+': 2,
        'A': 3,
        'B': 4
      };
      return [...conditions].sort((a, b) => (priority[a] || 99) - (priority[b] || 99));
    };

    const storages = sortStorages([...new Set(product.variations.map(v => v.storage))]);
    const colors = [...new Set(product.variations.map(v => v.color))];
    const conditions = sortConditions([...new Set(product.variations.map(v => v.condition))]);
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
        productType: selectedVariation.productType,
        packaging: selectedVariation.packaging || null
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

      <div className={`grid grid-cols-1 md:grid-cols-${allOptions.colors.length === 1 && allOptions.colors[0] === 'N/A' ? '3' : '4'} gap-4`}>
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

        {/* Color - Solo mostrar si no es N/A único */}
        {!(allOptions.colors.length === 1 && allOptions.colors[0] === 'N/A') && (
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
                      className={`w-4 h-4 rounded-full border border-gray-100 shadow-sm ${getColorSwatch(color)}`}
                    >
                    </div>
                    <span className="text-sm font-medium">{color}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
            {allOptions.conditions.map((condition) => {
              const matchingVariation = availableVariations.find(v => v.condition === condition);
              // Fallback: buscar cualquier variación con esa condición si no hay match exacto
              const fallbackVariation = product.variations.find(v => v.condition === condition);
              const isAvailable = !!matchingVariation;
              const isSelected = selectedVariation.condition === condition;
              const displayVariation = matchingVariation || fallbackVariation;

              return (
                <div
                  key={condition}
                  onClick={() => handleConditionChange(condition)}
                  className={`p-3 rounded-lg transition-all border flex-1 ${isSelected
                    ? 'bg-brand-green/10 border-brand-green text-brand-green cursor-pointer'
                    : isAvailable
                      ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700 cursor-pointer'
                      : 'bg-gray-50/50 border-gray-200/50 text-gray-400 opacity-40 cursor-pointer hover:opacity-60'
                    }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getConditionColor(condition)}`}
                    >
                      {condition}
                    </Badge>
                    <span className="text-sm font-medium">
                      {displayVariation
                        ? (displayVariation.price === 0 || !displayVariation.price ? 'N/A' : `€${displayVariation.price.toFixed(2)}`)
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


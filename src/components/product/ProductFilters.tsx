"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Filter, Search } from "lucide-react";
import { Product } from "@/lib/types/database";

interface ProductFiltersProps {
  products: Product[];
  onFilteredProductsChange: (filtered: Product[]) => void;
}

export function ProductFilters({ products, onFilteredProductsChange }: ProductFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [selectedProductType, setSelectedProductType] = useState<string>("all");
  const [selectedStorage, setSelectedStorage] = useState<string>("all");
  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Extraer opciones únicas de los productos y sus variaciones
  const filterOptions = useMemo(() => {
    if (products.length === 0) {
      return {
        categories: [],
        conditions: [],
        productTypes: [],
        storages: [],
        colors: [],
        maxPrice: 1000,
      };
    }

    const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

    // Extraer de todas las variaciones de todos los productos
    const allVariations = products.flatMap(p => p.variations || []);
    const conditions = [...new Set(allVariations.map(v => v.condition))].filter(Boolean);
    const productTypes = [...new Set(allVariations.map(v => v.productType))].filter(Boolean);
    const storages = [...new Set(allVariations.map(v => v.storage))].filter(Boolean);
    const colors = [...new Set(allVariations.map(v => v.color))].filter(Boolean);
    const maxPrice = Math.max(...allVariations.map(v => v.price || 0), 1000);

    return { categories, conditions, productTypes, storages, colors, maxPrice };
  }, [products]);

  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);

  // Actualizar rango de precio inicial cuando se cargan las opciones
  useEffect(() => {
    if (filterOptions.maxPrice > 1000) {
      setPriceRange([0, filterOptions.maxPrice]);
    }
  }, [filterOptions.maxPrice]);

  // Filtrar productos directamente en el frontend
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Búsqueda por nombre
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Categoría
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }

      // Verificar si el producto tiene variaciones que coincidan con los filtros
      const matchingVariations = product.variations.filter(variation => {
        // Condición
        if (selectedCondition !== "all" && variation.condition !== selectedCondition) {
          return false;
        }
        // Tipo de producto
        if (selectedProductType !== "all" && variation.productType !== selectedProductType) {
          return false;
        }
        // Almacenamiento
        if (selectedStorage !== "all" && variation.storage !== selectedStorage) {
          return false;
        }
        // Color
        if (selectedColor !== "all" && variation.color !== selectedColor) {
          return false;
        }
        // Rango de precio
        if (variation.price < priceRange[0] || variation.price > priceRange[1]) {
          return false;
        }
        return true;
      });

      // El producto pasa el filtro si tiene al menos una variación que coincida
      return matchingVariations.length > 0;
    });
  }, [products, searchTerm, selectedCategory, selectedCondition, selectedProductType, selectedStorage, selectedColor, priceRange]);

  // Notificar cambios en productos filtrados
  useEffect(() => {
    onFilteredProductsChange(filteredProducts);
  }, [filteredProducts, onFilteredProductsChange]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedCondition("all");
    setSelectedProductType("all");
    setSelectedStorage("all");
    setSelectedColor("all");
    setPriceRange([0, filterOptions.maxPrice]);
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "all" || selectedCondition !== "all" || selectedProductType !== "all" || selectedStorage !== "all" || selectedColor !== "all" || priceRange[0] > 0 || priceRange[1] < filterOptions.maxPrice;

  // Contar filtros activos
  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== "all" ? selectedCategory : null,
    selectedCondition !== "all" ? selectedCondition : null,
    selectedProductType !== "all" ? selectedProductType : null,
    selectedStorage !== "all" ? selectedStorage : null,
    selectedColor !== "all" ? selectedColor : null
  ].filter(Boolean).length;

  return (
    <div>
      {/* Barra de búsqueda y botón de filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {filterOptions.categories.map((category, index) => (
                    <SelectItem key={`category-${index}-${category}`} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Condición */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condición
              </label>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las condiciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las condiciones</SelectItem>
                  {filterOptions.conditions.map((condition, index) => (
                    <SelectItem key={`condition-${index}-${condition}`} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de producto
              </label>
              <Select value={selectedProductType} onValueChange={setSelectedProductType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {filterOptions.productTypes.map((type, index) => (
                    <SelectItem key={`type-${index}-${type}`} value={type}>
                      {type === 'NUEVO' ? 'Nuevo' :
                        type === 'CPO' ? 'CPO (Certified Pre-Owned)' :
                          type === 'ASIS' ? 'Apple ASIS' :
                            type === 'REACONDICIONADO' ? 'Reacond. Premium' :
                              type === 'USADO' ? 'Usado 100% Original' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Almacenamiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Almacenamiento
              </label>
              <Select value={selectedStorage} onValueChange={setSelectedStorage}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los almacenamientos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los almacenamientos</SelectItem>
                  {filterOptions.storages.map((storage, index) => (
                    <SelectItem key={`storage-${index}-${storage}`} value={storage}>
                      {storage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los colores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los colores</SelectItem>
                  {filterOptions.colors.map((color, index) => (
                    <SelectItem key={`color-${index}-${color}`} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rango de precio */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rango de precio: €{priceRange[0]} - €{priceRange[1]}
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={filterOptions.maxPrice}
                min={0}
                step={10}
                className="w-full"
              />
            </div>
          </div>

          {/* Botón para limpiar filtros */}
          {hasActiveFilters && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

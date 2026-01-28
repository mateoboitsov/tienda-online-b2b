"use client";

import { Badge } from "@/components/ui/badge";
import { Product, ProductVariation } from "@/lib/types/database";
import { HardDrive, Palette, Star, Shield, Package, Check } from "lucide-react";
import { getColorSwatch } from "@/lib/config/colorConstants";

interface ProductVariationsListProps {
    product: Product;
    selectedVariationId: string;
    onVariationChange: (variation: ProductVariation) => void;
}

export function ProductVariationsList({ product, selectedVariationId, onVariationChange }: ProductVariationsListProps) {
    // Función helper para el color de la condición
    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'NUEVO': return 'border-emerald-500 text-emerald-700 bg-emerald-50';
            case 'A+': return 'border-green-500 text-green-700 bg-green-50';
            case 'A': return 'border-blue-500 text-blue-700 bg-blue-50';
            case 'B': return 'border-yellow-500 text-yellow-700 bg-yellow-50';
            default: return 'border-gray-300 text-gray-700 bg-gray-50';
        }
    };

    // Ordenar variaciones por calidad (NUEVO > A+ > A > B) y luego por memoria (descendente)
    const sortedVariations = [...product.variations].sort((a, b) => {
        // Prioridad de condiciones (mejor a peor)
        const conditionPriority: { [key: string]: number } = {
            'NUEVO': 1,
            'A+': 2,
            'A': 3,
            'B': 4
        };

        const priorityA = conditionPriority[a.condition] || 99;
        const priorityB = conditionPriority[b.condition] || 99;

        // Si la condición es diferente, ordenar por condición
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        // Si la condición es igual, ordenar por storage (de mayor a menor)
        const parseStorage = (str: string) => {
            const match = str.match(/(\d+)(GB|TB)/i);
            if (!match) return 0;
            const value = parseInt(match[1]);
            const unit = match[2].toUpperCase();
            return unit === 'TB' ? value * 1024 : value;
        };

        return parseStorage(b.storage) - parseStorage(a.storage);
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-brand-black flex items-center gap-2">
                    <Package className="w-5 h-5 text-brand-green" />
                    Variaciones Disponibles
                </h3>
                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                    {product.variations.length} opciones encontradas
                </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="bg-gray-50/50 grid grid-cols-12 gap-4 px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <div className="col-span-3 flex items-center gap-2">
                        <HardDrive className="w-3 h-3" /> Memoria
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                        <Palette className="w-3 h-3" /> Color
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                        <Star className="w-3 h-3" /> Estado
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                        <Shield className="w-3 h-3" /> Tipo / Embalaje
                    </div>
                    <div className="col-span-2 text-right">Precio</div>
                </div>

                <div className="divide-y divide-gray-100 bg-white">
                    {sortedVariations.map((variation) => {
                        const isSelected = selectedVariationId === variation.id;
                        const hasStock = variation.stock > 0;

                        return (
                            <div
                                key={variation.id}
                                onClick={() => hasStock && onVariationChange(variation)}
                                className={`grid grid-cols-12 gap-4 px-4 py-4 items-center transition-all cursor-pointer group hover:bg-gray-50 relative ${isSelected
                                    ? 'bg-brand-green/10 z-10 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]'
                                    : !hasStock
                                        ? 'opacity-50 grayscale cursor-not-allowed'
                                        : ''
                                    }`}
                            >
                                {/* Indicador de selección lateral */}
                                {isSelected && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-green"></div>
                                )}

                                {/* Memoria */}
                                <div className="col-span-3 flex items-center gap-2">
                                    <span className={`text-sm font-bold ${isSelected ? 'text-brand-green' : 'text-brand-black'}`}>
                                        {variation.storage}
                                    </span>
                                    {!hasStock && (
                                        <span className="text-[10px] text-red-500 font-medium px-1.5 py-0.5 bg-red-50 rounded">Sin Stock</span>
                                    )}
                                </div>

                                {/* Color */}
                                <div className="col-span-2 flex items-center gap-2">
                                    <div
                                        className={`w-3 h-3 rounded-full border border-gray-200 shadow-sm ${getColorSwatch(variation.color)}`}
                                    ></div>
                                    <span className="text-xs text-gray-600 truncate">{variation.color}</span>
                                </div>

                                {/* Condición */}
                                <div className="col-span-2">
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] py-0 px-2 leading-none h-5 border font-bold ${getConditionColor(variation.condition)}`}
                                    >
                                        {variation.condition}
                                    </Badge>
                                </div>

                                {/* Tipo / Packaging */}
                                <div className="col-span-3 flex flex-col">
                                    <span className="text-[11px] text-gray-700 font-medium">
                                        {variation.productType === 'REACONDICIONADO' ? 'Reacond. Premium' : variation.productType}
                                    </span>
                                    {variation.packaging === 'Original Box' && (
                                        <span className="text-[10px] text-brand-green font-bold flex items-center gap-1 uppercase">
                                            <Check className="w-2.5 h-2.5" /> Caja Original
                                        </span>
                                    )}
                                </div>

                                {/* Precio */}
                                <div className="col-span-2 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className={`text-sm font-bold ${isSelected ? 'text-brand-green' : 'text-brand-black'}`}>
                                            {variation.price === 0 || !variation.price ? 'N/A' : `€${(variation.price + 5).toFixed(2)}`}
                                        </span>
                                        {variation.priceBulk && (
                                            <span className="text-[10px] text-brand-green font-bold bg-brand-green/10 px-1 py-0.5 rounded mt-0.5">
                                                +{variation.stock >= 50 ? '50' : '10'} unid: €{(variation.priceBulk + 5).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

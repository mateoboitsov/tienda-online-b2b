"use client";

import { Badge } from "@/components/ui/badge";
import { Product, ProductVariation } from "@/lib/types/database";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, HardDrive, Palette, Star, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getColorSwatch } from "@/lib/config/colorConstants";
import { productImageConfig } from "@/lib/config/imageConfig";

interface ProductCardListProps {
    product: Product;
}

export function ProductCardList({ product }: ProductCardListProps) {
    const { dispatch } = useCart();
    const router = useRouter();

    const handleAddToCart = (variation: ProductVariation) => {
        // Configuración por defecto para accesorios al añadir directamente
        const accessories = {
            screenProtector: false,
            caseWithCharger: true
        };

        // Calcular precio final
        let finalPrice = variation.price + 5;
        // Si tiene caja original no hay descuento ni cargo de caja, ya viene en el precio

        const configuredProduct: Product = {
            ...product,
            name: `${product.name} (${variation.storage} ${variation.color} ${variation.condition})`,
            price: finalPrice,
            storage: variation.storage,
            color: variation.color,
            condition: variation.condition as any,
            productType: variation.productType as any,
            inStock: variation.stock > 0,
            accessories: accessories
        };

        dispatch({ type: "ADD_ITEM", payload: configuredProduct });
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-brand-green/20 group animate-fade-in">
            <div className="flex flex-col md:flex-row">
                {/* Imagen Izquierda */}
                <div
                    className="md:w-1/4 relative bg-gray-50 flex items-center justify-center p-6 cursor-pointer overflow-hidden"
                    onClick={() => router.push(`/productos/${product.id}`)}
                >
                    <img
                        src={productImageConfig.getAutomaticImage(product.name) || productImageConfig.placeholders.smartphone}
                        alt={product.name}
                        className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3">
                        <Badge className="bg-white/90 backdrop-blur-sm text-brand-black border-gray-100 shadow-sm">
                            {product.brand}
                        </Badge>
                    </div>
                </div>

                {/* Contenido Derecha */}
                <div className="md:w-3/4 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3
                                className="text-xl font-bold text-brand-black cursor-pointer hover:text-brand-green transition-colors"
                                onClick={() => router.push(`/productos/${product.id}`)}
                            >
                                {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/productos/${product.id}`)}
                            className="rounded-full text-xs font-bold border-gray-200 hover:border-brand-green hover:text-brand-green hover:bg-brand-green/5 transition-all cursor-pointer"
                        >
                            Ver Detalle
                        </Button>
                    </div>

                    {/* Lista de Variaciones */}
                    <div className="mt-auto space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 rounded-t-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <div className="col-span-3">Memoria</div>
                            <div className="col-span-2">Estado</div>
                            <div className="col-span-3">Color</div>
                            <div className="col-span-2 text-right">Precio</div>
                            <div className="col-span-2"></div>
                        </div>

                        {[...product.variations].sort((a, b) => {
                            const conditionPriority: { [key: string]: number } = { 'NUEVO': 1, 'A+': 2, 'A': 3, 'B': 4 };
                            const priorityA = conditionPriority[a.condition] || 99;
                            const priorityB = conditionPriority[b.condition] || 99;
                            if (priorityA !== priorityB) return priorityA - priorityB;
                            const parseStorage = (str: string) => {
                                const match = str.match(/(\d+)(GB|TB)/i);
                                if (!match) return 0;
                                const value = parseInt(match[1]);
                                const unit = match[2].toUpperCase();
                                return unit === 'TB' ? value * 1024 : value;
                            };
                            return parseStorage(b.storage) - parseStorage(a.storage);
                        }).map((variation) => {
                            const hasStock = variation.stock > 0;
                            return (
                                <div
                                    key={variation.id}
                                    className={`grid grid-cols-12 gap-2 px-3 py-2 items-center rounded-lg border border-transparent hover:border-brand-green/20 hover:bg-brand-green/5 transition-all ${!hasStock ? 'opacity-40 grayscale' : ''}`}
                                >
                                    <div className="col-span-3 flex items-center gap-1.5">
                                        <HardDrive className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs font-bold text-brand-black">{variation.storage}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border-current font-bold ${variation.condition === 'A+' ? 'text-green-600 bg-green-50' :
                                            variation.condition === 'A' ? 'text-blue-600 bg-blue-50' :
                                                variation.condition === 'B' ? 'text-yellow-600 bg-yellow-50' : 'text-gray-500'
                                            }`}>
                                            {variation.condition}
                                        </Badge>
                                    </div>
                                    <div className="col-span-3 flex items-center gap-1.5">
                                        <div className={`w-2.5 h-2.5 rounded-full border border-gray-100 ${getColorSwatch(variation.color)}`}></div>
                                        <span className="text-xs text-gray-600 truncate">{variation.color}</span>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <span className="text-sm font-bold text-brand-black">€{(variation.price + 5).toFixed(2)}</span>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        {hasStock ? (
                                            <button
                                                onClick={() => handleAddToCart(variation)}
                                                className="p-1.5 rounded-full bg-brand-green text-white hover:bg-brand-green/90 transition-all shadow-sm"
                                                title="Añadir al carrito"
                                            >
                                                <ShoppingCart className="w-3.5 h-3.5" />
                                            </button>
                                        ) : (
                                            <span className="text-[9px] text-red-500 font-bold uppercase">Agotado</span>
                                        )}
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

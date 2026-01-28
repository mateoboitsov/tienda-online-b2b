"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { ProductCard } from "./ProductCard";
import { ProductFilters } from "./ProductFilters";
import { Product } from "@/lib/types/database";
import { getProducts } from "@/lib/services/productsService";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, MessageCircle, Smartphone, Truck, Shield, Package, Users, HeadphonesIcon, Banknote } from "lucide-react";

interface ProductsSectionProps {
  onProceedToCheckout: () => void;
}

export function ProductsSection({ onProceedToCheckout }: ProductsSectionProps) {
  const { state } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Cargar productos desde Supabase
  useEffect(() => {
    // Evitar cargas duplicadas
    if (isLoadingRef.current || hasLoadedRef.current) {
      return;
    }

    async function loadProducts() {
      isLoadingRef.current = true;
      try {
        setLoading(true);
        const productsData = await getProducts();
        setProducts(productsData);
        setFilteredProducts(productsData);
        hasLoadedRef.current = true;
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    }

    // Timeout de seguridad
    const timeoutId = setTimeout(() => {
      if (isLoadingRef.current) {
        console.warn('Timeout cargando productos, continuando...');
        isLoadingRef.current = false;
        setLoading(false);
      }
    }, 10000);

    loadProducts();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Callback memoizado para recibir productos filtrados
  const handleFilteredProductsChange = useCallback((filtered: Product[]) => {
    setFilteredProducts(filtered);
  }, []);

  // Memoizar cálculos costosos
  const { totalPrice, selectedProductsCount, productsInStock } = useMemo(() => {
    const total = state.items.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
    const count = state.items.reduce((total, item) => total + item.quantity, 0);
    const inStock = products.filter(product =>
      product.inStock ?? product.variations?.some(v => v.stock > 0) ?? false
    ).length;

    return { totalPrice: total, selectedProductsCount: count, productsInStock: inStock };
  }, [state.items, products]);

  return (
    <section className="py-16 bg-white">
      <div className="w-full mx-auto">
        {/* Header de la página */}
        <div className="text-center mb-12 px-6">
          <div className="mb-6">
            <div className="flex justify-center mb-3">
              <Smartphone className="w-12 h-12 text-brand-green" />
            </div>
            <h1 className="text-4xl font-bold text-brand-black mb-4">
              TIENDA B2B iPHONE
            </h1>
          </div>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Acceso exclusivo para empresas. Stock en tiempo real de iPhones, precios fijos sin IVA (Marginal VAT) con envío incluido,
            caja + cable + protector de pantalla. Sin negociación de precios.
          </p>
          <div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-green-500" />
              Envío 24-72h
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Opción de envío directo a cliente
            </span>
            <span className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-purple-500" />
              Servicio RMA premium
            </span>
          </div>
        </div>

        {/* Filtros de productos */}
        <div className="px-6 mb-8">
          <ProductFilters
            products={products}
            onFilteredProductsChange={handleFilteredProductsChange}
          />
        </div>

        {/* Grid de productos */}
        <div className="px-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product: Product) => (
                <div key={product.id} className="transform transition-all duration-200 hover:scale-105">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mensaje cuando no hay productos */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12 px-6">
            <h3 className="text-brand-black mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}

        {/* CTA de contacto */}
        <div className="text-center mt-16 px-6">
          <div className="w-24 h-px bg-gray-200 mx-auto mb-6"></div>
          <div className="bg-gray-50 rounded-2xl p-6 py-12 max-w-2xl mx-auto border border-gray-200">
            <h3 className="text-xl font-semibold text-brand-black mb-3">
              ¿No encuentras el iPhone que buscas?
            </h3>
            <p className="text-sm md:text-lg text-gray-600 mb-4">
              Contáctanos para solicitar modelos específicos, cantidades especiales o configuraciones personalizadas.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                Pedidos especiales
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                Cantidades B2B
              </span>
              <span className="flex items-center gap-2">
                <HeadphonesIcon className="w-4 h-4 text-green-500" />
                Soporte técnico
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

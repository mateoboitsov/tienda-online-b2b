"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductConfigurator } from "@/components/product/ProductConfigurator";
import { ProductVariationsList } from "@/components/product/ProductVariationsList";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  ArrowLeft,
  Truck,
  CheckCircle,
  XCircle,
  HardDrive,
  Palette,
  Plus,
  Minus,
  Package
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Product } from "@/lib/types/database";
import { getProduct } from "@/lib/services/productsService";

export default function ProductoPage() {
  const params = useParams();
  const router = useRouter();
  const { dispatch, state } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [productConfig, setProductConfig] = useState({
    storage: '',
    color: '',
    condition: '',
    productType: '',
    packaging: ''
  });
  const [selectedAccessories, setSelectedAccessories] = useState({
    screenProtector: false,
    caseWithCharger: true
  });
  const isLoadingRef = useRef(false);
  const loadedProductIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Si el ID del producto cambió, resetear el estado
    const productId = params.id as string;
    if (productId !== loadedProductIdRef.current) {
      loadedProductIdRef.current = null;
      isLoadingRef.current = false;
    }

    // Evitar cargas duplicadas
    if (isLoadingRef.current || !productId || loadedProductIdRef.current === productId) {
      return;
    }

    async function loadProduct() {
      isLoadingRef.current = true;
      try {
        setLoading(true);
        const foundProduct = await getProduct(productId);
        setProduct(foundProduct || null);

        if (foundProduct && foundProduct.variations.length > 0) {
          const firstVariation = foundProduct.variations[0];
          setProductConfig({
            storage: firstVariation.storage,
            color: firstVariation.color,
            condition: firstVariation.condition,
            productType: firstVariation.productType,
            packaging: firstVariation.packaging || ''
          });
        }
        loadedProductIdRef.current = productId;
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    }

    // Timeout de seguridad
    const timeoutId = setTimeout(() => {
      if (isLoadingRef.current) {
        console.warn('Timeout cargando producto, continuando...');
        isLoadingRef.current = false;
        setLoading(false);
      }
    }, 8000);

    loadProduct();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [params.id]);

  // Encontrar la variación seleccionada según la configuración
  const selectedVariation = useMemo(() => {
    if (!product) return null;
    return product.variations.find(v =>
      v.storage === productConfig.storage &&
      v.color === productConfig.color &&
      v.condition === productConfig.condition &&
      v.productType === productConfig.productType &&
      (v.packaging || '') === (productConfig.packaging || '')
    ) || product.variations[0];
  }, [product, productConfig]);

  // Funciones simplificadas - usan la variación seleccionada
  const getSelectedPrice = () => (selectedVariation?.price ? selectedVariation.price + 5 : product?.price ? product.price + 5 : 0);
  const isInStock = () => (selectedVariation?.stock || 0) > 0;
  const getStock = () => selectedVariation?.stock || 0;

  // Función para obtener el color del badge de condición
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'NUEVO': return 'border-emerald-500 text-emerald-700 bg-emerald-50';
      case 'A+': return 'border-green-500 text-green-700 bg-green-50';
      case 'A': return 'border-blue-500 text-blue-700 bg-blue-50';
      case 'B': return 'border-yellow-500 text-yellow-700 bg-yellow-50';
      default: return 'border-gray-300 text-gray-700 bg-gray-50';
    }
  };

  const handleAddToCart = () => {
    if (product) {
      // Calcular precio total con accesorios
      let totalPrice = getSelectedPrice();
      if (selectedAccessories.screenProtector) totalPrice += 3.50;
      // La caja está cargada por defecto (+5), si se desmarca la restamos
      if (!selectedAccessories.caseWithCharger) totalPrice -= 5;

      // No modificamos el ID aquí, el carrito se encarga de generar el uniqueId
      // basado en la configuración.

      // Crear nombre descriptivo
      let productName = product.name;
      if (!selectedAccessories.caseWithCharger && selectedAccessories.screenProtector) {
        productName += ' (Sin caja, Protector de pantalla)';
      } else if (!selectedAccessories.caseWithCharger) {
        productName += ' (Sin caja)';
      } else if (selectedAccessories.screenProtector) {
        productName += ' (Protector de pantalla)';
      }

      // Producto configurado para el carrito (usar la variación seleccionada)
      const configuredProduct: Product = {
        ...product,
        name: productName,
        price: totalPrice,
        // Usar valores de la variación seleccionada
        storage: selectedVariation?.storage || productConfig.storage,
        color: selectedVariation?.color || productConfig.color,
        condition: (selectedVariation?.condition || productConfig.condition) as 'NUEVO' | 'A+' | 'A' | 'B',
        productType: (selectedVariation?.productType || productConfig.productType) as 'NUEVO' | 'CPO' | 'ASIS' | 'REACONDICIONADO' | 'USADO',
        inStock: isInStock(),
        accessories: selectedAccessories
      };

      for (let i = 0; i < quantity; i++) {
        dispatch({ type: "ADD_ITEM", payload: configuredProduct });
      }
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    const maxStock = getStock();
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const handleConfigChange = useCallback((config: { storage: string; color: string; condition: string; productType: string; packaging: string | null }) => {
    setProductConfig({
      storage: config.storage,
      color: config.color,
      condition: config.condition,
      productType: config.productType,
      packaging: config.packaging || ''
    });
  }, []);

  const handleBackToProducts = () => {
    router.push('/productos');
  };

  // Efecto para manejar la lógica de packaging (Original Box)
  useEffect(() => {
    if (selectedVariation?.packaging === 'Original Box') {
      setSelectedAccessories(prev => ({
        ...prev,
        caseWithCharger: true
      }));
    } else {
      // Si no es Original Box, por defecto dejamos que la caja esté incluida 
      // pero el usuario puede ahora desmarcarla libremente
      setSelectedAccessories(prev => ({
        ...prev,
        caseWithCharger: true
      }));
    }
  }, [selectedVariation?.id, selectedVariation?.packaging]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando producto...</p>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-brand-black mb-2">Producto no encontrado</h1>
            <p className="text-gray-600 mb-6">El producto que buscas no existe o ha sido removido.</p>
            <Button onClick={handleBackToProducts} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a productos
            </Button>
          </div>
        </div>
      </>
    );
  }


  return (
    <>
      <Header />
      <div className="pt-20 min-h-screen bg-white">
        <div className="container mx-auto px-6 py-8">
          {/* Breadcrumb y botón de regreso */}
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={handleBackToProducts}
              variant="ghost"
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a productos
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Galería de imágenes del producto */}
            <div className="space-y-6">
              <ProductImageGallery
                images={product.images || []}
                productName={product.name}
                category={product.category}
                isInStock={isInStock()}
                stock={getStock()}
              />
            </div>

            {/* Información del producto */}
            <div className="space-y-6">
              {/* Título y categoría */}
              <div>
                <Badge variant="outline" className="border-brand-green/30 text-brand-green mb-3">
                  {product.category}
                </Badge>
                <h1 className="text-3xl font-bold text-brand-black mb-3">
                  {product.name}
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <Tabs defaultValue="list" className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Modo de selección</h4>
                  <TabsList className="grid grid-cols-2 w-[220px]">
                    <TabsTrigger value="configurator" className="gap-2 text-xs">
                      <Palette className="w-3.5 h-3.5" /> Pasos
                    </TabsTrigger>
                    <TabsTrigger value="list" className="gap-2 text-xs">
                      <Package className="w-3.5 h-3.5" /> Lista
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="configurator" className="mt-0 ring-0 focus-visible:ring-0">
                  <ProductConfigurator
                    product={product}
                    onConfigChange={handleConfigChange}
                  />
                </TabsContent>

                <TabsContent value="list" className="mt-0 ring-0 focus-visible:ring-0">
                  <ProductVariationsList
                    product={product}
                    selectedVariationId={selectedVariation?.id || ''}
                    onVariationChange={(variation) => {
                      setProductConfig({
                        storage: variation.storage,
                        color: variation.color,
                        condition: variation.condition,
                        productType: variation.productType,
                        packaging: variation.packaging || ''
                      });
                    }}
                  />
                </TabsContent>
              </Tabs>



              {/* Precio y estado */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-center justify-between mb-0 md:mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Cantidad:</span>
                    <div className="flex items-center space-x-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 cursor-pointer"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>

                      <Input
                        type="number"
                        min="1"
                        max={getStock()}
                        value={quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          const maxStock = getStock();
                          if (newQuantity >= 1 && newQuantity <= maxStock) {
                            setQuantity(newQuantity);
                          }
                        }}
                        className="w-12 h-6 text-center text-sm border-0 focus:ring-0 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 cursor-pointer"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= getStock()}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-center md:text-right">
                    <span className="text-3xl font-bold text-brand-black">
                      €{(() => {
                        let totalPrice = getSelectedPrice();
                        if (selectedAccessories.screenProtector) totalPrice += 3.50;
                        // La caja con cable ya está sumada (+5€), si se desmarca restamos esos 5€
                        if (!selectedAccessories.caseWithCharger) totalPrice -= 5;
                        return totalPrice.toFixed(2);
                      })()}
                    </span>
                    <p className="text-sm text-gray-500">Sin IVA (Marginal VAT)</p>

                  </div>
                </div>
              </div>

              {/* Accesorios incluidos y no incluidos */}
              <div className="space-y-4">
                {/* Complementa tu modelo */}
                <div>
                  <h4 className="text-sm font-semibold text-brand-black mb-3">Complementa tu modelo con:</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAccessories.screenProtector}
                          onChange={(e) => setSelectedAccessories(prev => ({
                            ...prev,
                            screenProtector: e.target.checked
                          }))}
                          className="w-5 h-5 text-brand-green border-gray-300 rounded focus:ring-brand-green cursor-pointer transition-colors"
                        />
                      </div>
                      <span className="text-sm text-brand-black group-hover:text-brand-green transition-colors">
                        Protector de pantalla Hidrogel <span className="text-brand-green font-semibold">+3,50€</span>
                      </span>
                    </label>

                    {selectedVariation?.packaging === 'Original Box' ? (
                      <div className="flex items-center gap-3 p-3 bg-brand-green/5 border border-brand-green/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-brand-green" />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-brand-green">Caja Original Apple (Incluida)</span>
                          <span className="text-xs text-brand-green/70">Esta variación incluye su caja original de fábrica.</span>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedAccessories.caseWithCharger}
                            onChange={(e) => setSelectedAccessories(prev => ({
                              ...prev,
                              caseWithCharger: e.target.checked
                            }))}
                            className="w-5 h-5 text-brand-green border-gray-300 rounded focus:ring-brand-green cursor-pointer transition-colors"
                          />
                        </div>
                        <span className="text-sm text-brand-black group-hover:text-brand-green transition-colors font-medium">
                          {selectedAccessories.caseWithCharger
                            ? <>Caja con Cable y Extractor SIM <span className="text-brand-green font-bold">(Incluido)</span></>
                            : <>Caja con Cable y Extractor SIM <span className="text-red-500 font-bold">Sin caja (-5€)</span></>
                          }
                        </span>
                      </label>
                    )}
                  </div>
                </div>

              </div>

              {/* Botón de agregar al carrito */}
              <div className="space-y-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!isInStock()}
                  size="lg"
                  className={`w-full h-12 text-base font-semibold ${isInStock()
                    ? 'bg-brand-green hover:bg-brand-green/90 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {isInStock() ? (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Agregar al carrito ({quantity})
                    </>
                  ) : (
                    "Producto agotado"
                  )}
                </Button>

                {!isInStock() && (
                  <p className="text-center text-gray-500">
                    Esta variación no está disponible actualmente
                  </p>
                )}

                {addedToCart && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">
                      ¡Producto agregado al carrito exitosamente!
                    </p>
                    <p className="text-green-600 text-sm">
                      {quantity} {quantity === 1 ? 'unidad' : 'unidades'} agregada{quantity === 1 ? '' : 's'}
                    </p>
                    {productConfig.storage && (
                      <p className="text-green-600 text-xs mt-1">
                        Configuración: {productConfig.storage} • {productConfig.color} • Grado {productConfig.condition}
                      </p>
                    )}
                    {(selectedAccessories.screenProtector || selectedAccessories.caseWithCharger) && (
                      <p className="text-green-600 text-xs mt-1">
                        Accesorios: {selectedAccessories.screenProtector ? 'Protector de pantalla, ' : ''}{selectedAccessories.caseWithCharger ? 'Caja con cable y herramienta SIM' : ''}
                      </p>
                    )}
                    <Button
                      onClick={() => router.push('/checkout')}
                      variant="outline"
                      size="sm"
                      className="mt-3 border-green-300 text-green-700 hover:bg-green-100"
                    >
                      Ver carrito
                    </Button>
                  </div>
                )}
              </div>

              {/* Características del producto */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-brand-black">Características principales</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Truck className="h-5 w-5 text-brand-green" />
                    <span className="text-sm text-gray-700">Envío 24-72h</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <CheckCircle className="h-5 w-5 text-brand-green" />
                    <span className="text-sm text-gray-700">Stock disponible</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <HardDrive className="h-5 w-5 text-brand-green" />
                    <span className="text-sm text-gray-700">Puedes enviar al cliente directamente</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Palette className="h-5 w-5 text-brand-green" />
                    <span className="text-sm text-gray-700">Soporte técnico premium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-16 space-y-8">
            <Separator />

            {/* Especificaciones técnicas */}
            <div>
              <h3 className="font-bold text-brand-black mb-6">Todos los dispositivos están 100% funcionales tras ser revisados en 25 puntos de control de calidad.</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h4 className="font-medium text-brand-black mb-3 text-brand-green">Funcionalidad Básica</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Botones
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Lector de tarjetas SIM/de memoria
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Eliminación de datos
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Cargadores/cables
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Desbloqueado por el propietario anterior
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      GPS/sistema de localización
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Cámaras
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Sensores externos
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-brand-black mb-3 text-brand-green">Sistemas y Conectividad</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Sensores biométricos
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Wi-Fi y Bluetooth
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Número de serie IMEI
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Daños por agua
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Flash y luces indicadoras
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Micrófonos y altavoces
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Puertos de entrada y salida
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Operadora
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-brand-black mb-3 text-brand-green">Componentes y Estado</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Estado de la batería
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Piezas mecánicas
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Compatibilidad de piezas
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Pantalla
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                      Otras características específicas
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Políticas de la empresa */}
            <div className="bg-gray-50 rounded-2xl py-8 px-4 md:p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-brand-black mb-2 md:mb-6">¿Por qué elegirnos?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="w-full h-[250px] p-6 bg-white rounded-2xl flex flex-col justify-between items-start border border-gray-200">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden bg-brand-green/10">
                    <svg className="w-8 h-8 text-brand-green" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <div className="flex flex-col justify-start items-start gap-1">
                    <h4 className="text-brand-black font-semibold">
                      Piezas Originales
                    </h4>
                    <p className="text-sm font-medium text-gray-600 max-w-[250px]">
                      Usados con piezas originales. Nada de compatibles.
                    </p>
                  </div>
                </div>
                <div className="w-full h-[250px] p-6 bg-white rounded-2xl flex flex-col justify-between items-start border border-gray-200">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden bg-brand-green/10">
                    <svg className="w-8 h-8 text-brand-green" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <div className="flex flex-col justify-start items-start gap-1">
                    <h4 className="text-brand-black font-semibold">
                      Entrega Exprés
                    </h4>
                    <p className="text-sm font-medium text-gray-600 max-w-[300px]">
                      Envíos en 24 horas a España y Portugal. <br />Envíos en 24-72 horas a Unión Europea, Suiza y Reino Unido.
                    </p>
                  </div>
                </div>
                <div className="w-full h-[250px] p-6 bg-white rounded-2xl flex flex-col justify-between items-start border border-gray-200">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden bg-brand-green/10">
                    <svg className="w-8 h-8 text-brand-green" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <div className="flex flex-col justify-start items-start gap-1">
                    <h4 className="text-brand-black font-semibold">
                      Atención Personalizada
                    </h4>
                    <p className="text-sm font-medium text-gray-600 max-w-[250px]">
                      Hablamos tu idioma: Español, Alemán, Inglés y Portugués.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useViewportAnimation } from "@/lib/utils/animations";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { getUserById, getUserByEmail, User as UserProfile } from "@/lib/services/usersService";
import { Product } from "@/lib/types/database";
import { getProduct, getProducts } from "@/lib/services/productsService";
import { processCheckout, CheckoutData } from "@/lib/services/checkoutService";
import { Package, Truck, Building2, User, MapPin, Phone, Mail, CreditCard, Shield, ArrowLeft, CheckCircle2, Building, FileText, Globe, Hash, Minus, Plus, Trash2, Clock, Calendar, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CheckoutProps {
  selectedProducts: { [key: string]: number };
  products: any[];
  onBack: () => void;
  onComplete: (shippingData: any) => void;
}

export function Checkout({ selectedProducts, products, onBack, onComplete }: CheckoutProps) {
  const { dispatch, state: cartState } = useCart();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Cargar todos los productos desde Supabase
  useEffect(() => {
    async function loadProducts() {
      try {
        const productsData = await getProducts();
        setAllProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }
    loadProducts();
  }, []);

  // Estado local para productos seleccionados (se sincroniza con el carrito)
  const [localSelectedProducts, setLocalSelectedProducts] = useState<{ [key: string]: number }>(() => {
    // Inicializar desde el carrito del contexto
    return cartState.items.reduce((acc, item) => {
      acc[item.uniqueId] = item.quantity;
      return acc;
    }, {} as { [key: string]: number });
  });

  // Sincronizar localSelectedProducts con el carrito real (cartState.items)
  // Usar el carrito del contexto en lugar de las props para evitar desincronización
  useEffect(() => {
    if (cartState.items.length > 0) {
      const productsFromCart = cartState.items.reduce((acc, item) => {
        acc[item.uniqueId] = item.quantity;
        return acc;
      }, {} as { [key: string]: number });
      setLocalSelectedProducts(productsFromCart);
    } else {
      // Si el carrito está vacío, limpiar también el estado local
      setLocalSelectedProducts({});
    }
  }, [cartState.items]);

  const [shippingType, setShippingType] = useState<"business" | "customer">("business");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "España",
    phone: "",
    email: ""
  });
  const [businessInfo, setBusinessInfo] = useState({
    companyName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "España",
    phone: "",
    email: "",
    taxId: ""
  });
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "card" | "budget">("transfer");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Nuevos estados para envío
  const [shippingCountry, setShippingCountry] = useState<string>("España");
  const [shippingSpeed, setShippingSpeed] = useState<string>("standard");
  const [otherCountry, setOtherCountry] = useState<string>("");

  // Hooks para animaciones
  const { elementRef: titleRef, animationStyle: titleAnimation } = useViewportAnimation<HTMLHeadingElement>('fadeInUp', 0.2);
  const { elementRef: formRef, animationStyle: formAnimation } = useViewportAnimation<HTMLFormElement>('fadeInUp', 0.4);

  const getSelectedProductsCount = () => {
    return Object.values(localSelectedProducts).reduce((total, quantity) => total + quantity, 0);
  };

  // Verificar si hay más de 5 productos para cambiar a presupuesto
  const totalProducts = getSelectedProductsCount();
  const isBudgetRequired = totalProducts > 5;

  // Helper para obtener la condición de un producto (con fallback a primera variación)
  const getProductCondition = (product: Product) => {
    return product.condition || product.variations?.[0]?.condition || "NUEVO";
  };

  // Helper para obtener el precio de un producto (con fallback a primera variación)
  const getProductPrice = (product: Product) => {
    return product.price || product.variations?.[0]?.price || 0;
  };

  // Verificar si hay productos nuevos (grado "NUEVO")
  const hasNewProducts = () => {
    return getSelectedProductsList().some(({ product }) =>
      getProductCondition(product) === "NUEVO"
    );
  };

  // Verificar si hay productos reacondicionados/usados (grados A+, A, B)
  const hasRefurbishedProducts = () => {
    return getSelectedProductsList().some(({ product }) => {
      const condition = getProductCondition(product);
      return condition === "A+" || condition === "A" || condition === "B";
    });
  };

  // Obtener país de envío
  const getShippingCountry = () => {
    let country = "";
    if (shippingType === "business") {
      country = businessInfo.country === "Otro" ? otherCountry : businessInfo.country;
    } else {
      country = customerInfo.country === "Otro" ? otherCountry : customerInfo.country;
    }
    return country;
  };

  // Manejar cambio de país
  const handleCountryChange = (country: string, type: "business" | "customer") => {
    if (type === "business") {
      setBusinessInfo(prev => ({ ...prev, country }));
      if (country !== "Otro") {
        setOtherCountry("");
      }
    } else {
      setCustomerInfo(prev => ({ ...prev, country }));
      if (country !== "Otro") {
        setOtherCountry("");
      }
    }
  };

  // Calcular precio de envío
  const getShippingPrice = () => {
    const country = getShippingCountry();
    const isSpainOrPortugal = country === "España" || country === "Portugal";

    if (isSpainOrPortugal) {
      if (shippingSpeed === "urgent") {
        return 9.99;
      } else if (shippingSpeed === "saturday") {
        return 12.00;
      } else {
        return 5.99; // estándar 24-48h
      }
    } else {
      // Para todos los demás países (Alemania, Italia, otros) - precio a consultar
      return 0;
    }
  };

  const profileLoadingRef = useRef(false);
  const profileUserIdRef = useRef<string | null>(null);
  const hasLoadedProfileRef = useRef(false);

  // Cargar información del perfil del usuario
  useEffect(() => {
    // Si no hay usuario, no cargar
    if (!user?.id) {
      setProfileLoading(false);
      return;
    }

    // Si el usuario cambió, resetear el estado
    if (user.id !== profileUserIdRef.current) {
      profileLoadingRef.current = false;
      hasLoadedProfileRef.current = false;
      profileUserIdRef.current = user.id;
      setProfileLoading(true); // Iniciar carga para el nuevo usuario
    }

    // Si ya se cargó el perfil para este usuario, no volver a cargar
    if (hasLoadedProfileRef.current && userProfile && userProfile.id === user.id) {
      setProfileLoading(false);
      profileLoadingRef.current = false;
      return;
    }

    // Si ya tenemos el perfil cargado pero no está marcado como cargado, marcarlo
    if (userProfile && userProfile.id === user.id && !hasLoadedProfileRef.current) {
      hasLoadedProfileRef.current = true;
      setProfileLoading(false);
      profileLoadingRef.current = false;
      return;
    }

    // Evitar cargas duplicadas simultáneas
    if (profileLoadingRef.current) {
      return;
    }

    const loadUserProfile = async () => {
      profileLoadingRef.current = true;
      setProfileLoading(true);

      try {
        console.log('🔄 Cargando perfil del usuario:', user.id);
        const profile = await getUserById(user.id);
        if (profile) {
          console.log('✅ Perfil cargado:', profile);
          console.log('📋 Datos del perfil:', {
            company: profile.company,
            cif: profile.cif,
            address: profile.address,
            city: profile.city,
            postal_code: profile.postal_code,
            phone: profile.phone,
          });
          setUserProfile(profile);

          // Rellenar automáticamente SOLO la información del negocio
          // Asegurarse de que todos los campos se carguen, incluso si son null
          setBusinessInfo(prev => ({
            companyName: profile.company || prev.companyName || "",
            address: profile.address || prev.address || "",
            city: profile.city || prev.city || "",
            postalCode: profile.postal_code || prev.postalCode || "",
            country: profile.country || prev.country || "España",
            phone: profile.phone || prev.phone || "",
            email: profile.business_email || profile.email || prev.email || "",
            taxId: profile.cif || prev.taxId || ""
          }));

          hasLoadedProfileRef.current = true;
          console.log('✅ Perfil establecido y marcado como cargado');
          // La información del cliente se mantiene vacía para que el usuario la complete manualmente
          // Solo se rellena automáticamente "Mi negocio", "Directo al cliente" queda vacío
          // Esto permite que el usuario pueda enviar a diferentes clientes sin sobrescribir datos
        } else {
          console.warn('⚠️ No se pudo cargar el perfil del usuario');
          // Si no se encuentra por ID, intentar por email
          if (user?.email) {
            console.log('🔄 Intentando cargar por email:', user.email);
            const profileByEmail = await getUserByEmail(user.email);
            if (profileByEmail) {
              console.log('✅ Perfil cargado por email:', profileByEmail);
              setUserProfile(profileByEmail);
              setBusinessInfo(prev => ({
                companyName: profileByEmail.company || prev.companyName || "",
                address: profileByEmail.address || prev.address || "",
                city: profileByEmail.city || prev.city || "",
                postalCode: profileByEmail.postal_code || prev.postalCode || "",
                country: profileByEmail.country || prev.country || "España",
                phone: profileByEmail.phone || prev.phone || "",
                email: profileByEmail.business_email || profileByEmail.email || prev.email || "",
                taxId: profileByEmail.cif || prev.taxId || ""
              }));
              hasLoadedProfileRef.current = true;
            }
          }
        }
      } catch (error) {
        console.error('❌ Error cargando perfil del usuario:', error);
      } finally {
        profileLoadingRef.current = false;
        setProfileLoading(false);
        console.log('🔄 Estado de carga actualizado: profileLoading = false');
      }
    };

    // Timeout de seguridad
    const timeoutId = setTimeout(() => {
      if (profileLoadingRef.current) {
        console.warn('Timeout cargando perfil, continuando...');
        profileLoadingRef.current = false;
        setProfileLoading(false);
      }
    }, 8000);

    loadUserProfile();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user?.id, user?.email]);

  // Cambiar automáticamente el método de pago según el número de productos
  useEffect(() => {
    if (isBudgetRequired) {
      setPaymentMethod("budget");
    } else {
      setPaymentMethod("transfer");
    }
  }, [isBudgetRequired]);

  // NOTA: Ya sincronizamos con cartState.items arriba, no necesitamos este useEffect
  // que dependía de selectedProducts (prop) porque puede estar desincronizado



  // Actualizar país de envío cuando cambie la información
  useEffect(() => {
    const country = getShippingCountry();
    setShippingCountry(country);

    // Resetear opciones de envío si cambia el país
    if (country && (country === "España" || country === "Portugal")) {
      setShippingSpeed("standard");
    } else if (country) {
      setShippingSpeed("urgent");
    }
  }, [businessInfo.country, customerInfo.country, shippingType]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Si la cantidad es 0 o menor, eliminar el producto
      const updatedProducts = { ...localSelectedProducts };
      delete updatedProducts[productId];
      setLocalSelectedProducts(updatedProducts);

      // También eliminar del contexto global del carrito
      dispatch({ type: "REMOVE_ITEM", payload: productId });
    } else {
      // Actualizar la cantidad
      setLocalSelectedProducts(prev => ({
        ...prev,
        [productId]: newQuantity
      }));

      // También actualizar en el contexto global del carrito
      dispatch({ type: "UPDATE_QUANTITY", payload: { id: productId, quantity: newQuantity } });
    }
  };

  const handleRemoveItem = (productId: string) => {
    const updatedProducts = { ...localSelectedProducts };
    delete updatedProducts[productId];
    setLocalSelectedProducts(updatedProducts);

    // También eliminar del contexto global del carrito
    dispatch({ type: "REMOVE_ITEM", payload: productId });
  };

  const getSelectedProductsList = () => {
    // Usar directamente los items del carrito que ya tienen toda la información
    return cartState.items.map(item => {
      // Buscar el producto completo desde allProducts usando el id del producto (no el uniqueId)
      const product = allProducts.find(p => p.id === item.id);
      return {
        product: product || item, // Si no se encuentra, usar el item del carrito que ya tiene los datos
        quantity: item.quantity,
        cartItem: item // Guardar referencia al item del carrito para usar uniqueId
      };
    }).filter(item => item.product);
  };

  const getTotalPrice = () => {
    // Usar directamente los items del carrito que ya tienen el precio
    const productsTotal = cartState.items.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);

    const shippingPrice = getShippingPrice();

    return productsTotal + shippingPrice;
  };

  // Encontrar variation_id para un producto del carrito
  const findVariationId = (product: Product, storage?: string, color?: string, condition?: string): string | undefined => {
    if (!product.variations || product.variations.length === 0) return undefined;

    // Buscar variación que coincida con storage, color, condition
    const variation = product.variations.find(v =>
      (!storage || v.storage === storage) &&
      (!color || v.color === color) &&
      (!condition || v.condition === condition)
    );

    return variation?.id || product.variations[0]?.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCheckoutError(null);

    if (!user?.id) {
      setCheckoutError("Debes estar autenticado para realizar un pedido");
      setIsSubmitting(false);
      return;
    }

    try {
      const checkoutItems = cartState.items.map(item => {
        // item.id es el id real del producto (UUID)
        // Sanitizar el ID en caso de que venga de una sesión antigua con sufijos (-cc, -sp)
        // Los UUID tienen 5 partes separadas por 4 guiones.
        const productIdParts = item.id.split('-');
        const baseProductId = productIdParts.length > 5
          ? productIdParts.slice(0, 5).join('-')
          : item.id;

        // Buscar el producto en la lista de productos de la base de datos
        const product = allProducts.find(p => p.id === baseProductId) || allProducts.find(p => p.id === item.id);

        if (!product) {
          throw new Error(`Producto ${baseProductId} no encontrado en el sistema`);
        }

        // Buscar la variación correspondiente usando los datos del item del carrito
        const variationId = findVariationId(
          product,
          item.storage,
          item.color,
          item.condition
        );

        return {
          product_id: product.id,
          variation_id: variationId,
          quantity: item.quantity,
          price: item.price || 0,
        };
      });

      if (checkoutItems.length === 0) {
        throw new Error("El carrito está vacío");
      }

      // Preparar datos del checkout
      const shippingAddress = shippingType === "business" ? businessInfo : customerInfo;
      const finalCountry = shippingAddress.country === "Otro" ? otherCountry : shippingAddress.country;

      const checkoutData: CheckoutData = {
        user_id: user.id,
        items: checkoutItems,
        shipping_address: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          postal_code: shippingAddress.postalCode,
          country: finalCountry,
          phone: shippingAddress.phone,
        },
        shipping_type: shippingType,
        shipping_speed: shippingSpeed as 'standard' | 'express',
        payment_method: paymentMethod,
        notes: paymentMethod === "budget" ? "Solicitud de presupuesto para pedido mayorista" : undefined,
      };

      // Procesar checkout con el servicio
      const result = await processCheckout(checkoutData);

      // Preparar datos de envío para la confirmación
      // IMPORTANTE: Guardar los datos del pedido ANTES de limpiar el carrito
      const orderItems = cartState.items.map(item => ({
        uniqueId: item.uniqueId,
        name: item.name,
        price: item.price || 0,
        quantity: item.quantity,
        storage: item.storage,
        color: item.color,
        condition: item.condition,
        description: item.description,
        category: item.category,
        inStock: item.inStock,
      }));

      const shippingData = {
        shippingType,
        shippingInfo: shippingAddress,
        shippingCountry: finalCountry,
        shippingSpeed,
        orderNumber: result.orderNumber,
        orderId: result.orderId,
        orderItems, // Pasar los items del pedido
        selectedProducts: cartState.items.reduce((acc, item) => {
          acc[item.uniqueId] = item.quantity;
          return acc;
        }, {} as { [key: string]: number }),
      };

      // Limpiar carrito después de éxito
      dispatch({ type: "CLEAR_CART" });

      // Mostrar confirmación
      onComplete(shippingData);
    } catch (error: any) {
      console.error("Error al procesar el pedido:", error);
      setCheckoutError(error?.message || "Error al procesar el pedido. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const hasBasicInfo = shippingType === "business"
      ? (businessInfo.companyName && businessInfo.address && businessInfo.city &&
        businessInfo.postalCode && businessInfo.phone && businessInfo.email &&
        businessInfo.country && (businessInfo.country !== "Otro" || otherCountry))
      : (customerInfo.name && customerInfo.address && customerInfo.city &&
        customerInfo.postalCode && customerInfo.phone && customerInfo.email &&
        customerInfo.country && (customerInfo.country !== "Otro" || otherCountry));

    const hasShippingInfo = shippingCountry && shippingSpeed;
    const hasTerms = acceptTerms;

    return hasBasicInfo && hasShippingInfo && hasTerms;
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-brand-white via-brand-gray to-brand-white py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header mejorado */}
        <div className="mb-16">
          <div
            ref={titleRef}
            className="mb-6"
            style={titleAnimation}
          >
            {/* Botón volver a tienda */}
            <div className="text-left">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-brand-green hover:text-brand-green/80 hover:bg-brand-green/10 !p-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a tienda
              </Button>
              <h1 className="text-4xl font-bold text-brand-black mb-4 mt-4">
                {paymentMethod === "budget" ? "Solicitar Presupuesto" : "Finalizar Pedido"}
              </h1>
              <p className="text-xl text-brand-black/70 max-w-2xl text-left">
                {paymentMethod === "budget"
                  ? "Para pedidos de más de 5 productos, contactaremos contigo para enviarte un presupuesto personalizado"
                  : "Completa la información de envío y pago para finalizar tu compra"
                }
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Formulario de checkout */}
          <div className="lg:col-span-3">
            {profileLoading && !userProfile ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
                  <p className="text-brand-black/70">Cargando información del perfil...</p>
                </div>
              </div>
            ) : (
              <>
                {checkoutError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{checkoutError}</AlertDescription>
                  </Alert>
                )}

                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  style={{
                    ...formAnimation,
                    opacity: 1 // Forzar opacidad 1 para evitar problemas con viewport animation
                  }}
                  className="space-y-6"
                >
                  {/* Configuración de envío */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center">
                          <Truck className="w-5 h-5 text-brand-green" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-brand-black">Configuración de Envío</CardTitle>
                          <CardDescription className="text-brand-black/60">
                            Elige el destino del envío y completa la información
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Tipo de envío */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-brand-black/80">Destino del envío</Label>
                        <Tabs value={shippingType} onValueChange={(value: string) => setShippingType(value as "business" | "customer")} className="w-full">
                          <TabsList className="grid w-full grid-cols-2 h-14 bg-brand-gray/30 border border-brand-black/10 rounded-xl p-1">
                            <TabsTrigger
                              value="business"
                              className="flex items-center space-x-3 rounded-lg transition-all duration-200 data-[state=active]:bg-muted data-[state=active]:text-brand-black data-[state=active]:scale-[1.02] data-[state=active]:border-2 data-[state=active]:border-brand-gray data-[state=inactive]:text-brand-black/70 data-[state=inactive]:hover:text-brand-black data-[state=inactive]:hover:bg-brand-white/50 cursor-pointer"
                            >
                              <Building2 className="w-5 h-5" />
                              <span className="font-medium">Mi negocio</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="customer"
                              className="flex items-center space-x-3 rounded-lg transition-all duration-200 data-[state=active]:bg-muted data-[state=active]:text-brand-black data-[state=active]:scale-[1.02] data-[state=active]:border-2 data-[state=active]:border-brand-gray data-[state=inactive]:text-brand-black/70 data-[state=inactive]:hover:text-brand-black data-[state=inactive]:hover:bg-brand-white/50 cursor-pointer"
                            >
                              <User className="w-5 h-5" />
                              <span className="font-medium">Directo al cliente</span>
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      {/* Información del negocio */}
                      {shippingType === "business" && (
                        <div className="space-y-6 pt-6 border-t border-brand-black/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Building2 className="w-5 h-5 text-brand-green" />
                              <h4 className="text-lg font-semibold text-brand-black">Información de tu negocio</h4>
                            </div>
                            {userProfile && (
                              <div className="flex items-center space-x-2 text-sm text-brand-green">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Datos cargados automáticamente</span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="businessCompanyName" className="text-sm font-medium text-brand-black/70">
                                Nombre de la empresa *
                              </Label>
                              <div className="relative">
                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-black/40" />
                                <Input
                                  id="businessCompanyName"
                                  value={businessInfo.companyName}
                                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, companyName: e.target.value }))}
                                  placeholder="Ej: Tech Solutions S.L."
                                  className="h-11 pl-10 border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20"
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="businessTaxId" className="text-sm font-medium text-brand-black/70">
                                CIF/NIF
                              </Label>
                              <div className="relative">
                                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-black/40" />
                                <Input
                                  id="businessTaxId"
                                  value={businessInfo.taxId}
                                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, taxId: e.target.value }))}
                                  placeholder="Ej: B12345678"
                                  className="h-11 pl-10 border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="businessAddress" className="text-sm font-medium text-brand-black/70">
                              Dirección *
                            </Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-black/40" />
                              <Input
                                id="businessAddress"
                                value={businessInfo.address}
                                onChange={(e) => setBusinessInfo(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Ej: Calle Mayor 123, Piso 2"
                                className="h-11 pl-10 border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="businessCity" className="text-sm font-medium text-brand-black/70">
                                Ciudad *
                              </Label>
                              <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-black/40" />
                                <Input
                                  id="businessCity"
                                  value={businessInfo.city}
                                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, city: e.target.value }))}
                                  placeholder="Ej: Madrid"
                                  className="h-11 pl-10 border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20"
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="businessPostalCode" className="text-sm font-medium text-brand-black/70">
                                Código Postal *
                              </Label>
                              <div className="relative">
                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-black/40" />
                                <Input
                                  id="businessPostalCode"
                                  value={businessInfo.postalCode}
                                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                                  placeholder="Ej: 28001"
                                  className="h-11 pl-10 border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20"
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="businessCountry" className="text-sm font-medium text-brand-black/70">
                                País *
                              </Label>
                              <div className="space-y-3">
                                <Select
                                  value={businessInfo.country}
                                  onValueChange={(value) => handleCountryChange(value, "business")}
                                >
                                  <SelectTrigger className="!h-11 w-full border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20">
                                    <SelectValue placeholder="Selecciona un país" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="España">España</SelectItem>
                                    <SelectItem value="Portugal">Portugal</SelectItem>
                                    <SelectItem value="Alemania">Alemania</SelectItem>
                                    <SelectItem value="Italia">Italia</SelectItem>
                                    <SelectItem value="Otro">Otro</SelectItem>
                                  </SelectContent>
                                </Select>

                                {businessInfo.country === "Otro" && (
                                  <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-black/40" />
                                    <Input
                                      value={otherCountry}
                                      onChange={(e) => setOtherCountry(e.target.value)}
                                      placeholder="Escribe el nombre del país"
                                      className="h-11 pl-10 border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20"
                                      required
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="businessPhone" className="text-sm font-medium text-brand-black/70">
                                Teléfono *
                              </Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-black/40" />
                                <Input
                                  id="businessPhone"
                                  value={businessInfo.phone}
                                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
                                  placeholder="Ej: +34 600 123 456"
                                  className="h-11 pl-10 border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20"
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="businessEmail" className="text-sm font-medium text-brand-black/70">
                                Email *
                              </Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-black/40" />
                                <Input
                                  id="businessEmail"
                                  type="email"
                                  value={businessInfo.email}
                                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, email: e.target.value }))}
                                  placeholder="Ej: info@empresa.com"
                                  className="h-11 pl-10 border-brand-black/20 focus:border-brand-green/20"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Información del cliente */}
                      {shippingType === "customer" && (
                        <div className="space-y-6 pt-6 border-t border-brand-black/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <User className="w-5 h-5 text-brand-green" />
                              <h4 className="text-lg font-semibold text-brand-black">Información del cliente</h4>
                            </div>
                            {/* No mostrar "Datos cargados automáticamente" en el tab del cliente */}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="customerName" className="text-sm font-medium text-brand-black/70">
                                Nombre completo *
                              </Label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-black/40" />
                                <Input
                                  id="customerName"
                                  value={customerInfo.name}
                                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="Ej: Juan Pérez García"
                                  className="h-11 pl-10 border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20"
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="customerPhone" className="text-sm font-medium text-brand-black/70">
                                Teléfono *
                              </Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-black/40" />
                                <Input
                                  id="customerPhone"
                                  value={customerInfo.phone}
                                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                                  placeholder="Ej: +34 600 123 456"
                                  className="h-11 pl-10 border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="customerAddress" className="text-sm font-medium text-brand-black/70">
                              Dirección de envío *
                            </Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-black/40" />
                              <Input
                                id="customerAddress"
                                value={customerInfo.address}
                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Ej: Calle del Sol 45, 3º B"
                                className="h-11 pl-10 border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="customerCity" className="text-sm font-medium text-brand-black/70">
                                Ciudad *
                              </Label>
                              <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-black/40" />
                                <Input
                                  id="customerCity"
                                  value={customerInfo.city}
                                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                                  placeholder="Ej: Barcelona"
                                  className="h-11 pl-10 border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20"
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="customerPostalCode" className="text-sm font-medium text-brand-black/70">
                                Código Postal *
                              </Label>
                              <div className="relative">
                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-black/40" />
                                <Input
                                  id="customerPostalCode"
                                  value={customerInfo.postalCode}
                                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                                  placeholder="Ej: 08001"
                                  className="h-11 pl-10 border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20"
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="customerCountry" className="text-sm font-medium text-brand-black/70">
                                País *
                              </Label>
                              <div className="space-y-3">
                                <Select
                                  value={customerInfo.country}
                                  onValueChange={(value) => handleCountryChange(value, "customer")}
                                >
                                  <SelectTrigger className="h-11 w-full border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20">
                                    <SelectValue placeholder="Selecciona un país" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="España">España</SelectItem>
                                    <SelectItem value="Portugal">Portugal</SelectItem>
                                    <SelectItem value="Alemania">Alemania</SelectItem>
                                    <SelectItem value="Italia">Italia</SelectItem>
                                    <SelectItem value="Otro">Otro</SelectItem>
                                  </SelectContent>
                                </Select>

                                {customerInfo.country === "Otro" && (
                                  <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-black/40" />
                                    <Input
                                      value={otherCountry}
                                      onChange={(e) => setOtherCountry(e.target.value)}
                                      placeholder="Escribe el nombre del país"
                                      className="h-11 pl-10 border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20"
                                      required
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="customerEmail" className="text-sm font-medium text-brand-black/70">
                              Email *
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-black/40" />
                              <Input
                                id="customerEmail"
                                type="email"
                                value={customerInfo.email}
                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="Ej: juan.perez@email.com"
                                className="h-11 pl-10 border-brand-black/20 focus:border-brand-green focus:ring-brand-green/20"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Opciones de envío */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center">
                          <Truck className="w-5 h-5 text-brand-green" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-brand-black">Opciones de Envío</CardTitle>
                          <CardDescription className="text-brand-black/60">
                            Selecciona el método y tiempo de entrega
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">


                      {/* Opciones de envío para España/Portugal */}
                      {shippingCountry && (shippingCountry === "España" || shippingCountry === "Portugal") && (
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-brand-black/80">Tiempo de entrega</Label>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-brand-gray/20 cursor-pointer">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="standard"
                                    name="shippingSpeed"
                                    value="standard"
                                    checked={shippingSpeed === "standard"}
                                    onChange={(e) => setShippingSpeed(e.target.value)}
                                    className="text-brand-green"
                                  />
                                  <div>
                                    <Label htmlFor="standard" className="text-sm font-medium cursor-pointer">
                                      Envío estándar 24-48h
                                    </Label>
                                    <p className="text-xs text-brand-black/60">Entrega en días laborables</p>
                                  </div>
                                </div>
                                <span className="font-bold text-brand-green">5,99€</span>
                              </div>

                              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-brand-gray/20 cursor-pointer">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="urgent"
                                    name="shippingSpeed"
                                    value="urgent"
                                    checked={shippingSpeed === "urgent"}
                                    onChange={(e) => setShippingSpeed(e.target.value)}
                                    className="text-brand-green"
                                  />
                                  <div>
                                    <Label htmlFor="urgent" className="text-sm font-medium cursor-pointer">
                                      Envío urgente 24h
                                    </Label>
                                    <p className="text-xs text-brand-black/60">Entrega al día siguiente</p>
                                  </div>
                                </div>
                                <span className="font-bold text-brand-green">9,99€</span>
                              </div>

                              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-brand-gray/20 cursor-pointer">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="saturday"
                                    name="shippingSpeed"
                                    value="saturday"
                                    checked={shippingSpeed === "saturday"}
                                    onChange={(e) => setShippingSpeed(e.target.value)}
                                    className="text-brand-green"
                                  />
                                  <div>
                                    <Label htmlFor="saturday" className="text-sm font-medium cursor-pointer">
                                      Entrega en Sábado
                                    </Label>
                                    <p className="text-xs text-brand-black/60">Entrega especial en fin de semana</p>
                                  </div>
                                </div>
                                <span className="font-bold text-brand-green">12,00€</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Opciones de envío para Alemania/Italia */}
                      {shippingCountry && (shippingCountry === "Alemania" || shippingCountry === "Italia") && (
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-brand-black/80">Tiempo de entrega</Label>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 border rounded-lg bg-brand-gray/20">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="standard-eu"
                                    name="shippingSpeed"
                                    value="standard"
                                    checked={shippingSpeed === "standard"}
                                    disabled
                                    className="text-brand-green"
                                  />
                                  <div>
                                    <Label htmlFor="standard-eu" className="text-sm font-medium">
                                      Envío urgente (24-72h)
                                    </Label>
                                    <p className="text-xs text-brand-black/60">Entrega en días laborables</p>
                                  </div>
                                </div>
                                <span className="font-bold text-brand-green">A consultar</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Opciones de envío para otros países */}
                      {shippingCountry && shippingCountry !== "España" && shippingCountry !== "Portugal" &&
                        shippingCountry !== "Alemania" && shippingCountry !== "Italia" && (
                          <div className="space-y-4">
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-brand-black/80">Tiempo de entrega</Label>

                              <div className="flex items-center justify-between p-3 border rounded-lg bg-brand-gray/20">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="urgent-international"
                                    name="shippingSpeed"
                                    value="urgent"
                                    checked={true}
                                    disabled
                                    className="text-brand-green"
                                  />
                                  <div>
                                    <Label htmlFor="urgent-international" className="text-sm font-medium">
                                      Envío urgente 24-72h
                                    </Label>
                                    <p className="text-xs text-brand-black/60">Envío internacional (seleccionado automáticamente)</p>
                                  </div>
                                </div>
                                <span className="font-bold text-brand-green">A consultar</span>
                              </div>

                              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-center space-x-2 text-orange-700">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-medium">Información adicional</span>
                                </div>
                                <p className="text-sm text-orange-600 mt-2">
                                  El precio exacto se calculará según el destino y peso del paquete. Te contactaremos para confirmar el coste final.
                                </p>
                              </div>

                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center space-x-2 text-yellow-700">
                                  <Calendar className="w-4 h-4" />
                                  <span className="font-medium">Tiempo de entrega</span>
                                </div>
                                <p className="text-sm text-yellow-600 mt-2">
                                  Los envíos internacionales pueden tardar entre 24-72 horas dependiendo del destino y aduanas.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}


                    </CardContent>
                  </Card>

                  {/* Método de pago */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-brand-green" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-brand-black">Método de Pago</CardTitle>
                          <CardDescription className="text-brand-black/60">
                            Elige cómo quieres pagar tu pedido
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Tabs value={paymentMethod} onValueChange={(value: string) => setPaymentMethod(value as "transfer" | "card" | "budget")} className="w-full">
                          <TabsList className="grid w-full grid-cols-3 h-14 bg-brand-gray/30 border border-brand-black/10 rounded-xl p-1">
                            <TabsTrigger
                              value="transfer"
                              disabled={isBudgetRequired}
                              className={`flex items-center space-x-3 rounded-lg transition-all duration-200 data-[state=active]:bg-muted data-[state=active]:text-brand-black data-[state=active]:scale-[1.02] data-[state=active]:border-2 data-[state=active]:border-brand-gray data-[state=inactive]:text-brand-black/70 data-[state=inactive]:hover:text-brand-black data-[state=inactive]:hover:bg-brand-white/50 cursor-pointer ${isBudgetRequired ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                              <Shield className="w-5 h-5" />
                              <span className="font-medium">Transferencia</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="card"
                              disabled={isBudgetRequired}
                              className={`flex items-center space-x-3 rounded-lg transition-all duration-200 data-[state=active]:bg-muted data-[state=active]:text-brand-black data-[state=active]:scale-[1.02] data-[state=active]:border-2 data-[state=active]:border-brand-gray data-[state=inactive]:text-brand-black/70 data-[state=active]:hover:text-brand-black data-[state=inactive]:hover:bg-brand-white/50 cursor-pointer ${isBudgetRequired ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                              <CreditCard className="w-5 h-5" />
                              <span className="font-medium">Tarjeta</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="budget"
                              disabled={!isBudgetRequired}
                              className={`flex items-center space-x-3 rounded-lg transition-all duration-200 data-[state=active]:bg-muted data-[state=active]:text-brand-black data-[state=active]:scale-[1.02] data-[state=active]:border-2 data-[state=active]:border-brand-gray data-[state=inactive]:text-brand-black/70 data-[state=inactive]:hover:text-brand-black data-[state=inactive]:hover:bg-brand-white/50 cursor-pointer ${!isBudgetRequired ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                              <FileText className="w-5 h-5" />
                              <span className="font-medium">Presupuesto</span>
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>



                        {paymentMethod === "transfer" && (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-2 text-green-700">
                              <Shield className="w-4 h-4" />
                              <span className="font-medium">Transferencia bancaria</span>
                            </div>
                            <p className="text-sm text-green-600 mt-2">
                              Recibirás los datos bancarios por email una vez confirmado el pedido.
                            </p>
                          </div>
                        )}

                        {paymentMethod === "card" && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-2 text-blue-700">
                              <CreditCard className="w-4 h-4" />
                              <span className="font-medium">Tarjeta de crédito/débito</span>
                            </div>
                            <p className="text-sm text-blue-600 mt-2">
                              Procesaremos tu pago de forma segura con tarjeta de crédito o débito.
                            </p>
                          </div>
                        )}

                        {paymentMethod === "budget" && (
                          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center space-x-2 text-orange-700">
                              <FileText className="w-4 h-4" />
                              <span className="font-medium">Solicitar presupuesto</span>
                            </div>
                            <p className="text-sm text-orange-600 mt-2">
                              Para pedidos de más de 5 productos, contactaremos contigo para enviarte un presupuesto personalizado con descuentos por volumen. <span className="font-bold">Rellena el formulario como si fuera un pedido normal.</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Términos y condiciones */}
                  <div>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                        required
                        className="mt-1"
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer text-brand-black/70">
                        Acepto los{" "}
                        <a href="#" className="text-brand-green hover:underline font-medium cursor-pointer">
                          términos y condiciones
                        </a>{" "}
                        y la{" "}
                        <a href="#" className="text-brand-green hover:underline font-medium cursor-pointer">
                          política de privacidad
                        </a>
                      </Label>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onBack}
                      className="flex-1 h-12 border-brand-black/20 hover:bg-brand-gray/50 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver a la Tienda
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isFormValid() || isSubmitting}
                      className="flex-1 h-12 bg-brand-green hover:bg-brand-green/90 shadow-lg cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Procesando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{paymentMethod === "budget" ? "Solicitar Presupuesto" : "Confirmar Pedido"}</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Panel lateral - Resumen del pedido */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 space-y-6">
              {/* Resumen del pedido */}
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-brand-green" />
                    <span>Resumen del Pedido</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Productos seleccionados */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {getSelectedProductsList().length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No hay productos en el carrito</p>
                        <p className="text-xs mt-1">Agrega productos desde la tienda</p>
                      </div>
                    ) : (
                      getSelectedProductsList().map(({ product, quantity, cartItem }) => {
                        // Usar uniqueId del carrito para las operaciones
                        const uniqueId = cartItem?.uniqueId || product.id;
                        // Obtener datos de configuración del item del carrito o del producto
                        const storage = cartItem?.storage || product.storage || product.variations?.[0]?.storage || 'N/A';
                        const color = cartItem?.color || product.color || product.variations?.[0]?.color || 'N/A';
                        const condition = cartItem?.condition || product.condition || product.variations?.[0]?.condition || 'N/A';
                        const price = cartItem?.price || getProductPrice(product);

                        return (
                          <div key={uniqueId} className="flex items-center space-x-2 p-4 border rounded-lg">
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">{product.name}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-base truncate">{product.name}</p>
                              {/* Mostrar especificaciones */}
                              <div className="flex flex-wrap gap-1 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {storage}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {color}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Grado {condition}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <p className={`text-base font-bold ${isBudgetRequired ? 'blur-sm' : ''} text-primary mt-2`}>€{price.toFixed(2)}</p>
                                <div className="flex items-center space-x-0 mt-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 cursor-pointer"
                                    onClick={() => handleQuantityChange(uniqueId, quantity - 1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>

                                  <Input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => {
                                      const newQuantity = parseInt(e.target.value) || 1;
                                      handleQuantityChange(uniqueId, newQuantity);
                                    }}
                                    className="w-12 h-6 text-center text-sm border-0 focus:ring-0 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />

                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 cursor-pointer"
                                    onClick={() => handleQuantityChange(uniqueId, quantity + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive cursor-pointer"
                              onClick={() => handleRemoveItem(uniqueId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Resumen de la compra - siempre visible */}
                  <div className="border-t pt-4 space-y-4">
                    {isBudgetRequired && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-blue-700">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-medium">¡El precio al por mayor es más bajo!</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          Para pedidos de más de 5 productos, nuestro equipo comercial te contactará en menos de 24h con un presupuesto personalizado. <span className="font-bold">Rellena el formulario como si fuera un pedido normal.</span>
                        </p>
                      </div>
                    )}

                    {/* Desglose de precios */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span>Subtotal productos:</span>
                        <span className={`${isBudgetRequired ? 'blur-sm' : ''}`}>
                          €{cartState.items.reduce((total, item) => {
                            return total + (item.price || 0) * item.quantity;
                          }, 0).toFixed(2)}
                        </span>
                      </div>

                      {getShippingPrice() > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span>Envío:</span>
                          <span className="text-brand-green font-medium">€{getShippingPrice().toFixed(2)}</span>
                        </div>
                      )}


                    </div>

                    <div className="flex justify-between items-center text-lg font-semibold pt-3 border-t border-brand-black/10">
                      <span>Total:</span>
                      <span className={`text-2xl ${isBudgetRequired ? 'blur-sm' : ''} text-primary`}>€{getTotalPrice().toFixed(2)}</span>
                    </div>

                    {/* Información adicional según tipo de producto */}
                    <div className="pt-4 border-t border-brand-black/10">
                      <div className="space-y-2">
                        {/* Productos Grado A+/A/B/C */}
                        {hasRefurbishedProducts() && (
                          <>
                            <div className="flex items-center space-x-2 text-xs text-brand-black/60">
                              <CheckCircle2 className="w-3 h-3 text-brand-green" />
                              <span>Garantía de 12 meses</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-brand-black/60">
                              <CheckCircle2 className="w-3 h-3 text-brand-green" />
                              <span>Caja genérica incluida</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-brand-black/60">
                              <CheckCircle2 className="w-3 h-3 text-brand-green" />
                              <span>Cable de carga incluido</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-brand-black/60">
                              <CheckCircle2 className="w-3 h-3 text-brand-green" />
                              <span>Pincho para extraer bandeja SIM</span>
                            </div>
                          </>
                        )}

                        {/* Productos Grado NUEVO */}
                        {hasNewProducts() && (
                          <>
                            <div className="flex items-center space-x-2 text-xs text-brand-black/60">
                              <CheckCircle2 className="w-3 h-3 text-brand-green" />
                              <span>Garantía oficial de fábrica</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-brand-black/60">
                              <CheckCircle2 className="w-3 h-3 text-brand-green" />
                              <span>Teléfono sellado de fábrica</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-brand-black/60">
                              <CheckCircle2 className="w-3 h-3 text-brand-green" />
                              <span>Caja original incluida</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-brand-black/60">
                              <CheckCircle2 className="w-3 h-3 text-brand-green" />
                              <span>Accesorios originales incluidos</span>
                            </div>
                          </>
                        )}

                        {/* Información de envío */}
                        <div className="flex items-center space-x-2 text-xs text-brand-black/60">
                          <Truck className="w-3 h-3 text-brand-green" />
                          <span>Envío</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

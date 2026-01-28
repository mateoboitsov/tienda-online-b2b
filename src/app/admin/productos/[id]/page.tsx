"use client";

import { useState, useEffect, use, useMemo } from "react";
import { getProductVariations, createVariation, updateVariation, deleteVariation } from "@/lib/services/variationsService";
import { getProduct } from "@/lib/services/productsService";
import { getColorSwatch } from "@/lib/config/colorConstants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, HardDrive, Palette, Star, Shield } from "lucide-react";
import Link from "next/link";

// Estructura de familias de productos actualizada a Enero 2026
const productFamilies = {
  "Smartphones": {
    "Apple": ["iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max", "iPhone 12 Mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max", "iPhone 13 Mini", "iPhone 14", "iPhone 14 Pro", "iPhone 14 Pro Max", "iPhone 14 Plus", "iPhone SE (3ª Gen)", "iPhone 15", "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 15 Plus", "iPhone 16", "iPhone 16 Pro", "iPhone 16 Pro Max", "iPhone 16 Plus", "iPhone 16e", "iPhone 17", "iPhone 17 Pro", "iPhone 17 Pro Max", "iPhone 17 Air"],
    "Samsung": ["Galaxy S21", "Galaxy S21+", "Galaxy S21 Ultra", "Galaxy S22", "Galaxy S22+", "Galaxy S22 Ultra", "Galaxy S23", "Galaxy S23+", "Galaxy S23 Ultra", "Galaxy S24", "Galaxy S24+", "Galaxy S24 Ultra", "Galaxy S25", "Galaxy S25+", "Galaxy S25 Ultra", "Galaxy S25 Slim", "Galaxy S26", "Galaxy S26+", "Galaxy S26 Ultra", "Galaxy Z Fold 7", "Galaxy Z Flip 7"],
    "Xiaomi": ["Xiaomi 12", "Xiaomi 12 Pro", "Xiaomi 12 Ultra", "Xiaomi 13", "Xiaomi 13 Pro", "Xiaomi 13 Ultra", "Xiaomi 14", "Xiaomi 14 Pro", "Xiaomi 14 Ultra", "Xiaomi 15", "Xiaomi 15 Pro", "Xiaomi 15 Ultra", "Xiaomi 16", "Xiaomi 16 Pro"],
    "Google": ["Pixel 6", "Pixel 7", "Pixel 7 Pro", "Pixel 7a", "Pixel 8", "Pixel 8 Pro", "Pixel 8a", "Pixel 9", "Pixel 9 Pro", "Pixel 9 Pro XL", "Pixel 9 Pro Fold", "Pixel 10", "Pixel 10 Pro", "Pixel 10 Pro XL", "Pixel 10 Pro Fold"],
    "Oppo": ["Find X5 Pro", "Find X6 Pro", "Find X7 Ultra", "Find X8 Pro", "Find X8 Ultra", "Find X9 Pro", "Find N5 Flip"],
    "Realme": ["GT Neo 5", "GT Neo 6", "GT 6", "GT 7 Pro", "GT 8 Pro"],
    "Poco": ["Poco F5", "Poco F6 Pro", "Poco F7 Pro", "Poco F8 Ultra", "Poco X6 Pro", "Poco X7 Pro", "Poco X8"],
    "ZTE": ["Axon 50 Ultra", "Axon 60 Ultra", "Axon 70 Ultra", "Nubia Z60 Ultra", "Nubia Z70 Ultra"]
  },
  "Tablets": {
    "Apple": ["iPad (10ª Gen)", "iPad Air (M2)", "iPad Air (M4)", "iPad Pro 11\" (M4)", "iPad Pro 13\" (M4)", "iPad mini (7ª Gen)"],
    "Samsung": ["Galaxy Tab S9", "Galaxy Tab S9 Ultra", "Galaxy Tab S10+", "Galaxy Tab S10 Ultra", "Galaxy Tab S11 Series"],
    "Xiaomi": ["Xiaomi Pad 6", "Xiaomi Pad 6S Pro", "Xiaomi Pad 7", "Xiaomi Pad 7 Pro"],
    "Google": ["Pixel Tablet 2"]
  },
  "Portatiles": {
    "Apple": ["MacBook Air M2", "MacBook Air M3", "MacBook Air M4", "MacBook Pro 14\" (M4/M4 Pro/M4 Max)", "MacBook Pro 16\" (M4 Pro/M4 Max)"],
    "Samsung": ["Galaxy Book 4 Ultra", "Galaxy Book 5 Pro", "Galaxy Book 5 Edge"]
  },
  "Relojes": {
    "Apple": ["Apple Watch Series 9", "Apple Watch Series 10", "Apple Watch Series 11", "Apple Watch SE (3ª Gen)", "Apple Watch Ultra 2", "Apple Watch Ultra 3"],
    "Samsung": ["Galaxy Watch 6", "Galaxy Watch 7", "Galaxy Watch 7 Ultra", "Galaxy Watch 8", "Galaxy Watch Ultra 2"]
  },
  "Otros": {
    "Apple": ["AirPods (4ª Gen)", "AirPods Pro (2ª Gen USB-C)", "AirPods Max 2", "Vision Pro", "Vision Air", "iMac (M4)", "Mac mini (M4)", "Mac Studio (M3)"],
    "Samsung": ["Galaxy Buds 3 Pro", "Galaxy Buds 4", "Galaxy Ring", "Galaxy Home 2", "Galaxy Station"]
  }
};



export default function ProductoVariacionesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deletingVariants, setDeletingVariants] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    storage: "",
    color: "",
    condition: "A+",
    productType: "CPO",
    stockQuantity: "",
    variantPrice: ""
  });
  const [productVariants, setProductVariants] = useState<any[]>([]);

  // Extraer colores únicos de todas las variaciones existentes + colores comunes
  const availableColors = useMemo(() => {
    const colorsFromVariations = new Set(productVariants.map((v: any) => v.color));
    // Agregar colores comunes por si acaso
    const commonColors = ["Negro", "Blanco", "Azul", "Rosa", "Amarillo", "Verde", "Rojo", "Púrpura", "Oro", "Plata", "Grafito", "Medianoche", "Estelar", "Titanio Natural", "Titanio Azul", "Titanio Blanco", "Titanio Negro", "Verde Sierra", "Azul Sierra", "Azul Pacífico"];
    commonColors.forEach(c => colorsFromVariations.add(c));
    return Array.from(colorsFromVariations).sort();
  }, [productVariants]);

  // Cargar producto desde Supabase y variaciones del servicio
  useEffect(() => {
    const loadProductAndVariations = async () => {
      try {
        setLoading(true);
        // Obtener producto desde Supabase
        const productData = await getProduct(id);
        const variationsData = await getProductVariations(id);

        if (productData) {
          setProducto({
            id: productData.id,
            name: productData.name,
            description: productData.description,
            brand: productData.name.split(' ')[0] || 'Versal',
            model: productData.name.split(' ').slice(1).join(' ') || productData.name,
            category: productData.category
          });
        }
        setProductVariants(variationsData);
      } catch (error) {
        console.error('Error cargando producto:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProductAndVariations();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <Link href="/admin/productos">
            <Button>Volver a Productos</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalStock = productVariants.reduce((sum: number, variant: any) => sum + (variant.stock || 0), 0);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const addProductVariant = async () => {
    if (!formData.storage || !formData.color || !formData.productType || !formData.condition || !formData.stockQuantity || !formData.variantPrice) {
      alert("Por favor, completa todas las opciones, especifica las existencias y el precio");
      return;
    }

    try {
      const newVariant = await createVariation(id, {
        storage: formData.storage,
        color: formData.color,
        condition: formData.condition as 'NUEVO' | 'A+' | 'A' | 'B',
        productType: formData.productType as 'NUEVO' | 'CPO' | 'ASIS' | 'REACONDICIONADO' | 'USADO',
        price: parseFloat(formData.variantPrice),
        stock: parseInt(formData.stockQuantity)
      });

      setProductVariants((prev: any[]) => [...prev, newVariant]);

      // Limpiar formulario
      setFormData((prev: any) => ({
        ...prev,
        storage: "",
        color: "",
        condition: "A+",
        productType: "CPO",
        stockQuantity: "",
        variantPrice: ""
      }));

      alert("Variación creada exitosamente");
    } catch (error) {
      console.error('Error creando variación:', error);
      alert("Error al crear la variación");
    }
  };

  const removeProductVariant = async (variantId: string) => {
    try {
      // Confirmar antes de eliminar
      if (!confirm('¿Estás seguro de que quieres eliminar esta variación? Esta acción no se puede deshacer.')) {
        return;
      }

      // Marcar como eliminando
      setDeletingVariants(prev => new Set(prev).add(variantId));

      // Eliminar de la base de datos
      await deleteVariation(variantId);

      // Actualizar el estado local
      setProductVariants((prev: any[]) => prev.filter((variant: any) => variant.id !== variantId));

      alert("Variación eliminada exitosamente de la base de datos");
    } catch (error) {
      console.error('Error eliminando variación:', error);
      alert("Error al eliminar la variación de la base de datos");
    } finally {
      // Remover del estado de eliminación
      setDeletingVariants(prev => {
        const newSet = new Set(prev);
        newSet.delete(variantId);
        return newSet;
      });
    }
  };



  // Obtener condiciones disponibles según el tipo de producto seleccionado
  const getAvailableConditions = (productType: string) => {
    if (productType === 'NUEVO') {
      return ['NUEVO'];
    } else if (productType === 'CPO') {
      return ['A+'];
    } else if (productType === 'ASIS') {
      return ['A+', 'A'];
    } else if (productType === 'USADO') {
      return ['A+', 'A', 'B'];
    } else if (productType === 'REACONDICIONADO') {
      return ['A+', 'A', 'B'];
    }
    return ['A+', 'A', 'B'];
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/productos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{producto.name}</h1>
            <p className="text-gray-600">{producto.brand} • {producto.category}</p>
          </div>
        </div>

        {/* Información del producto */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Información del Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{producto.description}</p>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">Variantes: <span className="font-medium">{productVariants.length}</span></span>
              <span className="text-gray-600">Stock total: <span className="font-medium">{totalStock}</span></span>
            </div>
          </CardContent>
        </Card>
        {/* Tabla de variaciones */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Variaciones y Existencias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Header de la tabla */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-700">
                  <div>Cantidad</div>
                  <div>Precio</div>
                  <div>Color</div>
                  <div>Memoria</div>
                  <div>Tipo</div>
                  <div>Estado</div>
                  <div>Acciones</div>
                </div>
              </div>

              {/* Filas de variantes */}
              {productVariants.map((variant: any) => (
                <div key={variant.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                  <div className="grid grid-cols-7 gap-4 items-center text-sm">
                    <div className="font-medium">{variant.stock}</div>
                    <div className="font-medium text-green-600">€{variant.price}</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getColorSwatch(variant.color)}`}></div>
                      {variant.color}
                    </div>
                    <div>{variant.storage}</div>
                    <div>
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-50 border-blue-200 text-blue-700"
                      >
                        {variant.productType === 'NUEVO' ? 'Nuevo' :
                          variant.productType === 'CPO' ? 'CPO' :
                            variant.productType === 'ASIS' ? 'ASIS' :
                              variant.productType === 'REACONDICIONADO' ? 'Reacond.' :
                                variant.productType === 'USADO' ? 'Usado' : variant.productType}
                      </Badge>
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getConditionColor(variant.condition)}`}
                      >
                        {variant.condition}
                      </Badge>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProductVariant(variant.id)}
                        disabled={deletingVariants.has(variant.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingVariants.has(variant.id) ? (
                          <>
                            <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                            Eliminando...
                          </>
                        ) : (
                          'Eliminar'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Configurar producto - Estilo igual que ProductConfigurator */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar producto</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Sistema de variantes - Siempre visible pero deshabilitado si no está completo */}
            <div className={`mb-6 p-4 border rounded-lg transition-all ${formData.storage && formData.color && formData.productType && formData.condition
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200'
              }`}>
              <h4 className={`text-sm font-medium mb-3 ${formData.storage && formData.color && formData.productType && formData.condition
                  ? 'text-blue-900'
                  : 'text-gray-500'
                }`}>
                Agregar esta configuración
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="stockQuantity" className={!formData.storage || !formData.color || !formData.productType || !formData.condition ? 'text-gray-400' : ''}>
                    Cantidad en stock *
                  </Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity || ""}
                    onChange={(e) => handleInputChange("stockQuantity", e.target.value)}
                    placeholder="0"
                    className={`w-full mt-2 ${!formData.storage || !formData.color || !formData.productType || !formData.condition
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : ''
                      }`}
                    disabled={!formData.storage || !formData.color || !formData.productType || !formData.condition}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="variantPrice" className={!formData.storage || !formData.color || !formData.productType || !formData.condition ? 'text-gray-400' : ''}>
                    Precio (€) *
                  </Label>
                  <Input
                    id="variantPrice"
                    type="number"
                    step="0.01"
                    value={formData.variantPrice || ""}
                    onChange={(e) => handleInputChange("variantPrice", e.target.value)}
                    placeholder="195.00"
                    className={`w-full mt-2 ${!formData.storage || !formData.color || !formData.productType || !formData.condition
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : ''
                      }`}
                    disabled={!formData.storage || !formData.color || !formData.productType || !formData.condition}
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={addProductVariant}
                    disabled={!formData.storage || !formData.color || !formData.productType || !formData.condition || !formData.stockQuantity || !formData.variantPrice}
                    className={`w-full ${!formData.storage || !formData.color || !formData.productType || !formData.condition
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                      }`}
                  >
                    Agregar configuración
                  </Button>
                </div>
              </div>
              <p className={`text-xs ${formData.storage && formData.color && formData.productType && formData.condition
                  ? 'text-blue-700'
                  : 'text-gray-500'
                }`}>
                {formData.storage && formData.color && formData.productType && formData.condition
                  ? `Configuración: ${formData.storage} | ${formData.color} | ${formData.productType} | ${formData.condition}`
                  : 'Selecciona todas las opciones para poder agregar una configuración'
                }
              </p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Almacenamiento */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <HardDrive className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-brand-black">Memoria</span>
                  </div>
                  <div className="space-y-2">
                    {["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB"].map((storage) => (
                      <div
                        key={storage}
                        onClick={() => handleInputChange("storage", storage)}
                        className={`p-3 rounded-lg cursor-pointer transition-all border ${formData.storage === storage
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
                    {availableColors.map((color) => (
                      <div
                        key={color}
                        onClick={() => handleInputChange("color", color)}
                        className={`p-3 rounded-lg cursor-pointer transition-all border flex items-center gap-3 ${formData.color === color
                            ? 'bg-brand-green/10 border-brand-green text-brand-green'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                          }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${getColorSwatch(color)}`}></div>
                        <span className="text-sm font-medium">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tipo de Producto */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-brand-black">Tipo</span>
                  </div>
                  <div className="space-y-2">
                    {/* Opciones predefinidas */}
                    {["NUEVO", "CPO", "ASIS", "REACONDICIONADO", "USADO"].map((productType) => (
                      <div
                        key={productType}
                        onClick={() => {
                          handleInputChange("productType", productType);
                          // Resetear condición si no es compatible con el nuevo tipo
                          const availableConditions = getAvailableConditions(productType);
                          if (!availableConditions.includes(formData.condition)) {
                            handleInputChange("condition", availableConditions[0]);
                          }
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-all border items-center gap-3 ${formData.productType === productType
                            ? 'bg-brand-green/10 border-brand-green text-brand-green'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                          }`}
                      >
                        <span className="text-sm font-medium">
                          {productType === 'NUEVO' ? 'Nuevo' :
                            productType === 'CPO' ? 'CPO (Certified Pre-Owned)' :
                              productType === 'ASIS' ? 'Apple ASIS' :
                                productType === 'REACONDICIONADO' ? 'Reacond. Premium' : 'Usado 100% Original'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estado */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-brand-black">Estado</span>
                  </div>
                  <div className="space-y-2">
                    {getAvailableConditions(formData.productType).map((condition) => (
                      <div
                        key={condition}
                        onClick={() => handleInputChange("condition", condition)}
                        className={`p-3 rounded-lg cursor-pointer transition-all border flex items-center gap-3 ${formData.condition === condition
                            ? 'bg-brand-green/10 border-brand-green text-brand-green'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                          }`}
                      >
                        <Badge
                          variant="outline"
                          className={`text-xs ${getConditionColor(condition)}`}
                        >
                          {condition}
                        </Badge>
                        <span className="text-sm font-medium">
                          {condition === 'NUEVO' ? '' :
                            condition === 'A+' ? 'Premium' :
                              condition === 'A' ? 'Excelente' :
                                condition === 'B' ? 'Bueno' : 'Correcto'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}

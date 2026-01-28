"use client";

import { useState, useEffect } from "react";
import { createProduct, getAllProductsForAdmin, deleteProduct, reactivateProduct } from "@/lib/services/productsService";
import { createVariation } from "@/lib/services/variationsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Eye, Trash2, RotateCcw, Package } from "lucide-react";
import Link from "next/link";
import { AdminNavbar } from "@/components/layout/AdminNavbar";

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

const availableCategories = ["Smartphones", "Tablets", "Portatiles", "Relojes", "Otros"];
const availableBrands = ["Apple", "Samsung", "Xiaomi", "Oppo", "Google", "Poco", "Realme", "ZTE"];



export default function ProductosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Información del producto base
    brand: "",
    model: "",
    description: "",
    category: "",
    // Primera variación
    storage: "128GB",
    color: "Negro",
    productType: "NUEVO",
    condition: "NUEVO",
    price: "",
    stock: "",
    // Accesorios
    screenProtector: false,
    caseWithCharger: true
  });

  // Cargar productos desde Supabase
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const productsData = await getAllProductsForAdmin();  // Traer todos, activos e inactivos
        setProductos(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validar campos requeridos del producto base
      if (!formData.brand || !formData.model || !formData.description || !formData.category) {
        alert("Por favor completa todos los campos del producto (marca, modelo, descripción, categoría)");
        return;
      }

      // Validar campos requeridos de la primera variación
      if (!formData.price || !formData.stock) {
        alert("Por favor completa precio y stock de la primera variación");
        return;
      }

      // Validar precio
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        alert("El precio debe ser un número válido mayor o igual a 0");
        return;
      }

      // Validar stock
      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        alert("El stock debe ser un número entero mayor o igual a 0");
        return;
      }

      // 1. Crear producto base (sin variaciones)
      const productData = {
        name: `${formData.brand} ${formData.model}`,
        description: formData.description,
        brand: formData.brand,
        model: formData.model,
        category: formData.category,
        images: [],
        // Campos opcionales para compatibilidad
        price: price,
        in_stock: stock > 0
      };

      const newProduct = await createProduct(productData);

      // 2. Crear primera variación
      await createVariation(newProduct.id, {
        storage: formData.storage,
        color: formData.color,
        condition: formData.condition as 'NUEVO' | 'A+' | 'A' | 'B',
        productType: formData.productType as 'NUEVO' | 'CPO' | 'ASIS' | 'REACONDICIONADO' | 'USADO',
        price: price,
        stock: stock
      });

      alert("Producto y primera variación creados exitosamente");

      // Recargar productos desde la DB
      const productsData = await getAllProductsForAdmin();
      setProductos(productsData);

      setFormData({
        brand: "",
        model: "",
        description: "",
        category: "",
        storage: "128GB",
        color: "Negro",
        productType: "NUEVO",
        condition: "NUEVO",
        price: "",
        stock: "",
        screenProtector: false,
        caseWithCharger: true
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error creando producto:', error);
      const errorMessage = error.message || error.toString();
      alert(`Error al crear el producto: ${errorMessage}`);
    }
  };

  const handleToggleProduct = async (productId: string, productName: string, isActive: boolean) => {
    const action = isActive ? 'ocultar' : 'reactivar';
    const message = isActive
      ? `¿Estás seguro de que quieres ocultar "${productName}" de la tienda?\n\nEl producto no se eliminará, solo dejará de aparecer en la tienda. Los pedidos anteriores seguirán funcionando.`
      : `¿Estás seguro de que quieres reactivar "${productName}"?\n\nEl producto volverá a aparecer en la tienda.`;

    if (!confirm(message)) {
      return;
    }

    try {
      if (isActive) {
        await deleteProduct(productId);
        alert("Producto ocultado exitosamente");
      } else {
        await reactivateProduct(productId);
        alert("Producto reactivado exitosamente");
      }

      // Recargar productos
      const productsData = await getAllProductsForAdmin();
      setProductos(productsData);
    } catch (error: any) {
      console.error(`Error al ${action} producto:`, error);
      const errorMessage = error.message || error.toString();
      alert(`Error al ${action} el producto: ${errorMessage}`);
    }
  };

  // Obtener modelos disponibles según la marca seleccionada
  const getAvailableModels = (brand: string) => {
    if (brand && productFamilies[formData.category as keyof typeof productFamilies]) {
      const categoryData = productFamilies[formData.category as keyof typeof productFamilies];
      if (categoryData[brand as keyof typeof categoryData]) {
        return categoryData[brand as keyof typeof categoryData];
      }
    }
    return [];
  };

  // Obtener marcas disponibles según la categoría seleccionada
  const getAvailableBrands = (category: string) => {
    if (category && productFamilies[category as keyof typeof productFamilies]) {
      return Object.keys(productFamilies[category as keyof typeof productFamilies]);
    }
    return availableBrands;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
            <p className="text-gray-600">Añadir, editar y gestionar productos de la tienda</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[95vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl">Agregar Nuevo Producto</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                {/* SECCIÓN 1: Información del Producto Base */}
                <div className="space-y-4 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="text-base sm:text-lg font-bold text-blue-900 flex items-center gap-2">
                    <Package className="w-5 h-5" /> Información del Producto
                  </h3>

                  {/* Selección de Categoría, Marca y Modelo */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Categoría */}
                    <div className="space-y-1.5">
                      <Label htmlFor="category" className="text-sm font-semibold text-blue-800">Categoría *</Label>
                      <Select value={formData.category} onValueChange={(value) => {
                        handleInputChange("category", value);
                        handleInputChange("brand", "");
                        handleInputChange("model", "");
                      }}>
                        <SelectTrigger className="bg-white border-blue-200">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Marca */}
                    <div className="space-y-1.5">
                      <Label htmlFor="brand" className="text-sm font-semibold text-blue-800">Marca *</Label>
                      <Select
                        value={formData.brand}
                        onValueChange={(value) => {
                          handleInputChange("brand", value);
                          handleInputChange("model", "");
                        }}
                        disabled={!formData.category}
                      >
                        <SelectTrigger className="bg-white border-blue-200">
                          <SelectValue placeholder="Seleccionar marca" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableBrands(formData.category).map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Modelo */}
                    <div className="space-y-1.5">
                      <Label htmlFor="model" className="text-sm font-semibold text-blue-800">Modelo *</Label>
                      <Select
                        value={formData.model}
                        onValueChange={(value) => handleInputChange("model", value)}
                        disabled={!formData.brand}
                      >
                        <SelectTrigger className="bg-white border-blue-200">
                          <SelectValue placeholder="Seleccionar modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableModels(formData.brand).map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-sm font-semibold text-blue-800">Descripción *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Escribe aquí los detalles principales del producto..."
                      className="bg-white border-blue-200 min-h-[100px]"
                      required
                    />
                  </div>
                </div>

                {/* SECCIÓN 2: Primera Variación */}
                <div className="space-y-4 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100">
                  <h3 className="text-base sm:text-lg font-bold text-green-900 flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Configuración Inicial
                  </h3>

                  {/* Precio y Stock */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="price" className="text-sm font-semibold text-green-800">Precio (€) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        placeholder="0.00"
                        className="bg-white border-green-200"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="stock" className="text-sm font-semibold text-green-800">Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => handleInputChange("stock", e.target.value)}
                        placeholder="0"
                        className="bg-white border-green-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Almacenamiento y Color */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="storage" className="text-sm font-semibold text-green-800">Alm. *</Label>
                      <Select value={formData.storage} onValueChange={(value) => handleInputChange("storage", value)}>
                        <SelectTrigger className="bg-white border-green-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="64GB">64GB</SelectItem>
                          <SelectItem value="128GB">128GB</SelectItem>
                          <SelectItem value="256GB">256GB</SelectItem>
                          <SelectItem value="512GB">512GB</SelectItem>
                          <SelectItem value="1TB">1TB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="color" className="text-sm font-semibold text-green-800">Color *</Label>
                      <Select value={formData.color} onValueChange={(value) => handleInputChange("color", value)}>
                        <SelectTrigger className="bg-white border-green-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <SelectItem value="Negro">Negro</SelectItem>
                          <SelectItem value="Blanco">Blanco</SelectItem>
                          <SelectItem value="Azul">Azul</SelectItem>
                          <SelectItem value="Grafito">Grafito</SelectItem>
                          <SelectItem value="Titanio Natural">Titanio Nat.</SelectItem>
                          <SelectItem value="Titanio Azul">Titanio Azul</SelectItem>
                          <SelectItem value="Plata">Plata</SelectItem>
                          <SelectItem value="Oro">Oro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tipo de Producto y Condición */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="productType" className="text-sm font-semibold text-green-800">Tipo *</Label>
                      <Select value={formData.productType} onValueChange={(value) => handleInputChange("productType", value)}>
                        <SelectTrigger className="bg-white border-green-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NUEVO">NUEVO</SelectItem>
                          <SelectItem value="CPO">CPO</SelectItem>
                          <SelectItem value="ASIS">ASIS</SelectItem>
                          <SelectItem value="REACONDICIONADO">REACOND.</SelectItem>
                          <SelectItem value="USADO">USADO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="condition" className="text-sm font-semibold text-green-800">Cond. *</Label>
                      <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                        <SelectTrigger className="bg-white border-green-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NUEVO">NUEVO</SelectItem>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end sm:pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsDialogOpen(false)}
                    className="order-2 sm:order-1 text-gray-500"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={!formData.brand || !formData.model || !formData.description || !formData.category || !formData.price || !formData.stock || !formData.storage || !formData.color}
                    className="order-1 sm:order-2 bg-[#00A650] hover:bg-[#008540] text-white font-bold py-6 sm:py-2"
                  >
                    Crear Producto
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio (Rango)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productos.map((producto: any) => {
                    const priceRange = producto.variations && producto.variations.length > 0
                      ? {
                        min: Math.min(...producto.variations.map((v: any) => v.price)),
                        max: Math.max(...producto.variations.map((v: any) => v.price))
                      }
                      : { min: producto.price || 0, max: producto.price || 0 };

                    const totalStock = producto.variations && producto.variations.length > 0
                      ? producto.variations.reduce((acc: number, v: any) => acc + (v.stock || 0), 0)
                      : (producto.stock_quantity || 0);

                    return (
                      <tr key={producto.id} className={!producto.active ? 'bg-gray-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">{producto.name}</div>
                            <div className="text-sm text-gray-500">{producto.brand}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {producto.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {priceRange.min === priceRange.max
                            ? `${priceRange.min}€`
                            : `${priceRange.min}€ - ${priceRange.max}€`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm ${totalStock > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}`}>
                            {totalStock} unidades
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${producto.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {producto.active ? 'Activo' : 'Oculto'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                          <Link href={`/admin/productos/${producto.id}`} className="text-[#00A650] hover:text-[#008540]">
                            Editar
                          </Link>
                          <button
                            onClick={() => handleToggleProduct(producto.id, producto.name, producto.active)}
                            className={`${producto.active ? 'text-red-600 hover:text-red-900' : 'text-blue-600 hover:text-blue-900'}`}
                          >
                            {producto.active ? 'Ocultar' : 'Reactivar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

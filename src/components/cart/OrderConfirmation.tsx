"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useViewportAnimation } from "@/lib/utils/animations";
import { CheckCircle, Package, Truck, Building2, User, Mail, Phone, MapPin } from "lucide-react";

interface OrderConfirmationProps {
  orderNumber: string;
  selectedProducts: { [key: string]: number };
  products: any[];
  shippingType: "business" | "customer";
  shippingInfo: any;
  onBackToStore: () => void;
}

export function OrderConfirmation({ 
  orderNumber, 
  selectedProducts, 
  products, 
  shippingType, 
  shippingInfo, 
  onBackToStore 
}: OrderConfirmationProps) {
  // Hooks para animaciones
  const { elementRef: titleRef, animationStyle: titleAnimation } = useViewportAnimation<HTMLHeadingElement>('fadeInUp', 0.2);
  const { elementRef: cardRef, animationStyle: cardAnimation } = useViewportAnimation<HTMLDivElement>('fadeInUp', 0.4);

  const getSelectedProductsList = () => {
    return Object.entries(selectedProducts).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return { product, quantity };
    }).filter(item => item.product);
  };

  const getTotalPrice = () => {
    return Object.entries(selectedProducts).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product?.price || 0) * quantity;
    }, 0);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-brand-white via-brand-gray to-brand-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header de confirmación */}
          <div className="text-center mb-12">
            <div 
              ref={titleRef}
              className="mb-6"
              style={titleAnimation}
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-brand-black mb-4">
                ¡Pedido Confirmado!
              </h1>
              <p className="text-brand-black/70 text-lg">
                Tu pedido B2B ha sido procesado correctamente
              </p>
            </div>
            
            <Badge className="bg-brand-green text-white text-lg px-6 py-3">
              Número de Pedido: {orderNumber}
            </Badge>
          </div>

          {/* Detalles del pedido */}
          <Card 
            ref={cardRef}
            className="border-brand-black/10 shadow-lg mb-8"
            style={cardAnimation}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Resumen del Pedido</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Productos */}
              <div>
                <h4 className="font-medium text-brand-black mb-3">Productos:</h4>
                {getSelectedProductsList().length === 0 ? (
                  <div className="text-center py-4 text-brand-black/60">
                    No se encontraron productos en el pedido
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getSelectedProductsList().map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between items-center p-3 bg-brand-gray/30 rounded-lg">
                      <div>
                        <span className="font-medium">{product.name}</span>
                        <span className="text-brand-black/60 ml-2">× {quantity}</span>
                        {/* Mostrar especificaciones si están disponibles */}
                        {(product.storage || product.color || product.condition) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.storage && (
                              <Badge variant="outline" className="text-xs">
                                {product.storage}
                              </Badge>
                            )}
                            {product.color && (
                              <Badge variant="outline" className="text-xs">
                                {product.color}
                              </Badge>
                            )}
                            {product.condition && (
                              <Badge variant="outline" className="text-xs">
                                Grado {product.condition}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-brand-green">
                        €{((product.price || 0) * quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-brand-black/10 pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total del Pedido:</span>
                  <span className="text-brand-green">€{getTotalPrice().toFixed(2)}</span>
                </div>
                <p className="text-sm text-brand-black/60 mt-1">
                  Envío incluido • Caja + Cable + Protector incluidos
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información de envío */}
          <Card className="border-brand-black/10 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="w-5 h-5" />
                <span>Información de Envío</span>
              </CardTitle>
              <CardDescription>
                {shippingType === "business" ? "Envío a tu negocio" : "Envío directo al cliente"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {shippingType === "business" ? (
                      <Building2 className="w-4 h-4 text-brand-green" />
                    ) : (
                      <User className="w-4 h-4 text-brand-green" />
                    )}
                    <span className="font-medium">
                      {shippingType === "business" ? "Empresa:" : "Cliente:"}
                    </span>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {shippingType === "business" ? shippingInfo.companyName : shippingInfo.name}
                      </span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-brand-black/40 mt-0.5" />
                      <div className="text-sm text-brand-black/70">
                        <div>{shippingInfo.address}</div>
                        <div>
                          {shippingInfo.postalCode} {shippingInfo.city}
                        </div>
                        <div>{shippingInfo.country}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-brand-black/40" />
                      <span className="text-sm text-brand-black/70">{shippingInfo.phone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-brand-black/40" />
                      <span className="text-sm text-brand-black/70">{shippingInfo.email}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium text-brand-black">Próximos pasos:</h5>
                  <div className="space-y-2 text-sm text-brand-black/70">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-brand-green rounded-full mt-2"></div>
                      <span>Recibirás un email de confirmación</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-brand-green rounded-full mt-2"></div>
                      <span>Procesaremos tu pedido en 24-48h</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-brand-green rounded-full mt-2"></div>
                      <span>Te notificaremos cuando se envíe</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-brand-green rounded-full mt-2"></div>
                      <span>Entrega en 24-72h según destino</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="border-brand-black/10 shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Información Importante</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-brand-black mb-2">Garantía:</h5>
                  <ul className="text-sm text-brand-black/70 space-y-1">
                    <li>• Todos los productos incluyen garantía</li>
                    <li>• Servicio RMA premium disponible</li>
                    <li>• Soporte técnico especializado</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-brand-black mb-2">Incluido en el precio:</h5>
                  <ul className="text-sm text-brand-black/70 space-y-1">
                    <li>• Envío gratuito</li>
                    <li>• Caja original</li>
                    <li>• Cable de carga</li>
                    <li>• Protector de pantalla</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="text-center space-y-4">
            <Button
              onClick={onBackToStore}
              className="bg-brand-green hover:bg-brand-green/90 text-white px-8 py-3 text-lg"
            >
              Volver a la Tienda B2B
            </Button>
            
            <div className="text-sm text-brand-black/60">
              ¿Tienes alguna pregunta?{" "}
              <a href="#contacto" className="text-brand-green hover:underline font-medium">
                Contáctanos
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

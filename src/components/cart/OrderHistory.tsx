"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOrdersByUserId, getOrderItems, Order, OrderItem } from "@/lib/services/ordersService";
import { Package, Calendar, Truck, Eye, MapPin, Banknote } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OrderItemsList } from "./OrderItemsList";

interface OrderHistoryProps {
  userId: string;
}

export function OrderHistory({ userId }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, OrderItem[]>>({});
  const [loadingItemsMap, setLoadingItemsMap] = useState<Record<string, boolean>>({});
  const isLoadingRef = useRef(false);
  const loadedUserIdRef = useRef<string | null>(null);

  const loadOrders = async () => {
    // Evitar cargas duplicadas
    if (isLoadingRef.current || loadedUserIdRef.current === userId) {
      return;
    }

    isLoadingRef.current = true;
    try {
      setLoading(true);
      const userOrders = await getOrdersByUserId(userId);
      setOrders(userOrders);
      loadedUserIdRef.current = userId;
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    // Si el userId cambió, resetear el estado
    if (userId !== loadedUserIdRef.current) {
      loadedUserIdRef.current = null;
      isLoadingRef.current = false;
    }

    if (userId && !isLoadingRef.current) {
      // Timeout de seguridad
      const timeoutId = setTimeout(() => {
        if (isLoadingRef.current) {
          console.warn('Timeout cargando pedidos, continuando...');
          isLoadingRef.current = false;
          setLoading(false);
        }
      }, 8000);

      loadOrders();

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [userId]);

  const loadOrderDetails = async (order: Order) => {
    // Si ya tenemos los items, no recargar
    if (orderItemsMap[order.id]) {
      setSelectedOrderId(order.id);
      return;
    }

    try {
      setLoadingItemsMap(prev => ({ ...prev, [order.id]: true }));
      setSelectedOrderId(order.id);
      const items = await getOrderItems(order.id);
      setOrderItemsMap(prev => ({ ...prev, [order.id]: items }));
    } catch (error) {
      console.error('Error cargando detalles del pedido:', error);
    } finally {
      setLoadingItemsMap(prev => ({ ...prev, [order.id]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'En Proceso';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">Cargando historial de pedidos...</div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Historial de Pedidos
          </CardTitle>
          <CardDescription>Gestiona y revisa tus pedidos anteriores</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500 py-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No tienes pedidos aún</p>
            <p className="text-sm mt-2">Tus pedidos aparecerán aquí una vez que realices una compra</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Historial de Pedidos
        </CardTitle>
        <CardDescription>Gestiona y revisa tus pedidos anteriores</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="border-l-4 border-l-brand-green overflow-hidden">
            <CardContent className="p-0">
              {/* Header del pedido */}
              <div className="px-5 pb-4 pt-0 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-3 md:gap-0 items-start md:items-center justify-between">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-3">
                    <h3 className="font-semibold text-lg text-gray-900">Pedido {order.order_number}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadOrderDetails(order)}
                        className="shrink-0"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Detalles del Pedido: <br />{order.order_number}</DialogTitle>
                      </DialogHeader>

                      {loadingItemsMap[order.id] ? (
                        <div className="text-center py-8">Cargando detalles...</div>
                      ) : (
                        <div className="space-y-6">
                          {/* Información del pedido */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Estado</p>
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusLabel(order.status)}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Fecha</p>
                              <p className="font-medium">{formatDate(order.created_at)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Total</p>
                              <p className="font-medium text-lg">€{order.total_amount.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Envío</p>
                              <p className="font-medium">€{order.shipping_cost.toFixed(2)}</p>
                            </div>
                          </div>

                          {/* Items del pedido */}
                          <OrderItemsList items={orderItemsMap[order.id] || []} />

                          {/* Información de envío */}
                          {order.shipping_info && (
                            <div>
                              <h4 className="font-semibold mb-3">Dirección de Envío</h4>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p>{order.shipping_info.address}</p>
                                <p>{order.shipping_info.city}, {order.shipping_info.postal_code}</p>
                                <p>{order.shipping_info.country}</p>
                                {order.shipping_info.phone && <p>Tel: {order.shipping_info.phone}</p>}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Contenido principal */}
              <div className="px-5 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fecha</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Banknote className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total</p>
                      <p className="text-sm font-semibold text-gray-900">€{order.total_amount.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Truck className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Destino</p>
                      <p className="text-sm font-medium text-gray-900">{order.shipping_country}</p>
                    </div>
                  </div>
                </div>

                {/* Dirección de envío */}
                {order.shipping_info && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <MapPin className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Dirección de Envío</p>
                        <p className="text-sm text-gray-900">
                          {order.shipping_info.address}
                        </p>
                        <p className="text-sm text-gray-900">
                          {order.shipping_info.city}, {order.shipping_info.postal_code}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

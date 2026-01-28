"use client";

import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus, getOrderItems, Order, OrderItem } from "@/lib/services/ordersService";
import { getAllUsers } from "@/lib/services/usersService";
import { getVariationById } from "@/lib/services/variationsService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Calendar, Truck, User, MapPin, Eye, CheckCircle, Clock, XCircle, Banknote } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OrderItemsList } from "@/components/cart/OrderItemsList";

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, OrderItem[]>>({});
  const [loadingItemsMap, setLoadingItemsMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allOrders, allUsers] = await Promise.all([
        getAllOrders(),
        getAllUsers()
      ]);
      setOrders(allOrders);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Error al cargar pedidos' });
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (order: Order) => {
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

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      if (updated) {
        setMessage({ type: 'success', text: 'Estado del pedido actualizado correctamente' });
        await loadData();
      } else {
        setMessage({ type: 'error', text: 'Error al actualizar el estado del pedido' });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setMessage({ type: 'error', text: 'Error al actualizar el estado del pedido' });
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

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.name} (${user.company})` : userId;
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
              <p className="text-gray-600">Gestiona y actualiza el estado de los pedidos</p>
            </div>
          </div>

          {message && (
            <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Todos ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendientes ({pendingOrders.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Todos los Pedidos */}
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Todos los Pedidos</CardTitle>
                <CardDescription>Vista completa de todos los pedidos del sistema</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="text-center py-8 px-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando pedidos...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 px-6 text-gray-500 border-t border-gray-100">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No hay pedidos registrados</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3 text-left">Pedido</th>
                          <th className="px-6 py-3 text-left">Cliente</th>
                          <th className="px-6 py-3 text-left">Fecha</th>
                          <th className="px-6 py-3 text-left">Total</th>
                          <th className="px-6 py-3 text-left">Estado</th>
                          <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {orders.map((order) => (
                          <OrderRow
                            key={order.id}
                            order={order}
                            getUserName={getUserName}
                            getStatusColor={getStatusColor}
                            getStatusLabel={getStatusLabel}
                            formatDate={formatDate}
                            onUpdateStatus={handleUpdateStatus}
                            onViewDetails={loadOrderDetails}
                            orderItems={orderItemsMap[order.id] || []}
                            loadingItems={loadingItemsMap[order.id] || false}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Pedidos Pendientes */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Pendientes</CardTitle>
                <CardDescription>Pedidos que requieren atención</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-8 px-6 text-gray-500 border-t border-gray-100">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No hay pedidos pendientes</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3 text-left">Pedido</th>
                          <th className="px-6 py-3 text-left">Cliente</th>
                          <th className="px-6 py-3 text-left">Fecha</th>
                          <th className="px-6 py-3 text-left">Total</th>
                          <th className="px-6 py-3 text-left">Estado</th>
                          <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingOrders.map((order) => (
                          <OrderRow
                            key={order.id}
                            order={order}
                            getUserName={getUserName}
                            getStatusColor={getStatusColor}
                            getStatusLabel={getStatusLabel}
                            formatDate={formatDate}
                            onUpdateStatus={handleUpdateStatus}
                            onViewDetails={loadOrderDetails}
                            orderItems={orderItemsMap[order.id] || []}
                            loadingItems={loadingItemsMap[order.id] || false}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface OrderRowProps {
  order: Order;
  getUserName: (userId: string) => string;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  formatDate: (date: string) => string;
  onUpdateStatus: (orderId: string, status: string) => void;
  onViewDetails: (order: Order) => void;
  orderItems: OrderItem[];
  loadingItems: boolean;
}

function OrderRow({
  order,
  getUserName,
  getStatusColor,
  getStatusLabel,
  formatDate,
  onUpdateStatus,
  onViewDetails,
  orderItems,
  loadingItems,
}: OrderRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
        {order.order_number}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <div className="text-sm text-gray-900 font-medium">{getUserName(order.user_id).split(' (')[0]}</div>
          <div className="text-xs text-gray-500">{getUserName(order.user_id).split(' (')[1]?.replace(')', '')}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
        {formatDate(order.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 text-sm">
        €{order.total_amount.toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right space-x-4">
        <Dialog>
          <DialogTrigger asChild>
            <button
              onClick={() => onViewDetails(order)}
              className="text-[#00A650] hover:text-[#008540] font-semibold text-sm transition-colors"
            >
              Ver Detalles
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Pedido: {order.order_number}</DialogTitle>
            </DialogHeader>

            {loadingItems ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A650]"></div>
              </div>
            ) : (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Estado</p>
                    <Badge className={`${getStatusColor(order.status)} border-none text-[10px]`}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Fecha</p>
                    <p className="font-semibold text-sm">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total</p>
                    <p className="font-bold text-[#00A650]">€{order.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Envío</p>
                    <p className="font-semibold text-sm">€{order.shipping_cost.toFixed(2)}</p>
                  </div>
                </div>

                <div className="border rounded-xl overflow-hidden">
                  <OrderItemsList items={orderItems} />
                </div>

                {order.shipping_info && (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Envío
                    </h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p className="font-medium text-blue-900">{getUserName(order.user_id)}</p>
                      <p>{order.shipping_info.address}</p>
                      <p>{order.shipping_info.city}, {order.shipping_info.postal_code}</p>
                      <p className="font-medium">{order.shipping_info.country}</p>
                      {order.shipping_info.phone && <p className="text-xs pt-1">Tel: {order.shipping_info.phone}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <select
          value={order.status}
          onChange={(e) => onUpdateStatus(order.id, e.target.value)}
          className="text-xs border-gray-200 rounded-lg shadow-sm focus:ring-[#00A650] focus:border-[#00A650] py-1 pl-2 pr-8 transition-shadow"
        >
          <option value="pending">Pendiente</option>
          <option value="processing">En Proceso</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </td>
    </tr>
  );
}

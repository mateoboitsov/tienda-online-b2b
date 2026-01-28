import { DatabaseOrder } from '../types/database';
import { updateVariation, getVariationById } from './variationsService';
import { createClient } from '../supabase/client';

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: string
  total_amount: number
  shipping_cost: number
  shipping_type: string
  shipping_country: string
  shipping_speed: string
  payment_method: string
  shipping_info: any
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  selected_storage?: string
  selected_color?: string
  selected_condition?: string
  variation_id?: string
  created_at: string
}

// Generar número de pedido único
function generateOrderNumber(): string {
  return `B2B-${Date.now().toString().slice(-6)}`;
}

export async function createOrder(orderData: Partial<DatabaseOrder>): Promise<Order> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: orderData.user_id ?? '',
      order_number: orderData.order_number ?? generateOrderNumber(),
      status: orderData.status ?? 'pending',
      total_amount: orderData.total_amount ?? 0,
      shipping_cost: orderData.shipping_cost ?? 0,
      shipping_type: orderData.shipping_type ?? 'business',
      shipping_country: orderData.shipping_country ?? '',
      shipping_speed: orderData.shipping_speed ?? 'standard',
      payment_method: orderData.payment_method ?? '',
      shipping_info: orderData.shipping_info ?? {},
      notes: orderData.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  return data as Order;
}

export async function createOrderItem(itemData: {
  order_id: string
  product_id: string
  variation_id?: string
  quantity: number
  price: number
}): Promise<void> {
  const supabase = createClient();
  // Obtener información de la variación para guardar en order_items
  let selected_storage = '';
  let selected_color = '';
  let selected_condition = '';

  if (itemData.variation_id) {
    try {
      const variation = await getVariationById(itemData.variation_id);
      selected_storage = variation.storage;
      selected_color = variation.color;
      selected_condition = variation.condition;
    } catch (error) {
      console.warn('No se pudo obtener información de la variación:', error);
    }
  }

  const { error } = await supabase
    .from('order_items')
    .insert({
      order_id: itemData.order_id,
      product_id: itemData.product_id,
      quantity: itemData.quantity,
      unit_price: itemData.price,
      total_price: itemData.price * itemData.quantity,
      selected_storage,
      selected_color,
      selected_condition,
    });

  if (error) {
    console.error('Error creating order item:', error);
    throw error;
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No encontrado
    }
    console.error('Error getting order:', error);
    throw error;
  }

  return data as Order;
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting orders by user:', error);
    throw error;
  }

  return (data || []) as Order[];
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }

  return (data || []) as Order[];
}

export async function updateOrderStatus(id: string, status: string): Promise<Order | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }

  return data as Order;
}

// Obtener items de un pedido
export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) {
    console.error('Error getting order items:', error);
    throw error;
  }

  // Mapear a OrderItem (adaptar campos)
  return (data || []).map((item: any) => ({
    id: item.id,
    order_id: item.order_id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
    selected_storage: item.selected_storage,
    selected_color: item.selected_color,
    selected_condition: item.selected_condition,
    variation_id: item.variation_id,
    created_at: item.created_at,
  })) as OrderItem[];
}

// Actualizar stock de producto (usado cuando se procesa un pedido)
// Nota: Los productos base no tienen stock, solo las variaciones
export async function updateProductStock(productId: string, newStock: number): Promise<{ stock_quantity: number; in_stock: boolean }> {
  // Esta función se mantiene por compatibilidad pero no hace nada real
  // El stock está en las variaciones, no en el producto base
  return { stock_quantity: newStock, in_stock: newStock > 0 };
}

// Actualizar stock de variación (usado cuando se procesa un pedido)
export async function updateVariationStock(variationId: string, newStock: number): Promise<void> {
  await updateVariation(variationId, {
    stock: newStock
  });
}

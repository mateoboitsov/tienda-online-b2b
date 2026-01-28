import { createOrder, createOrderItem } from './ordersService'
import { getProduct } from './productsService'
import { getVariationById, updateVariation } from './variationsService'

export interface CheckoutData {
  user_id: string
  items: CheckoutItem[]
  shipping_address: {
    address: string
    city: string
    postal_code: string
    country: string
    phone: string
  }
  shipping_type: 'business' | 'customer'
  shipping_speed: 'standard' | 'express'
  payment_method: string
  notes?: string
}

export interface CheckoutItem {
  product_id: string
  variation_id?: string
  quantity: number
  price: number
}

// Calcular costo de envío
function calculateShippingCost(country: string, speed: string): number {
  const isSpainOrPortugal = country === 'España' || country === 'Portugal';
  
  if (isSpainOrPortugal) {
    if (speed === 'express' || speed === 'urgent') return 9.99;
    if (speed === 'saturday') return 12.00;
    return 5.99; // standard
  }
  
  return 0; // Para otros países, precio a consultar
}

export async function processCheckout(checkoutData: CheckoutData): Promise<{ orderId: string; orderNumber: string }> {
  // 1. Validar stock de cada item
  for (const item of checkoutData.items) {
    const product = await getProduct(item.product_id);
    if (!product) {
      throw new Error(`Producto ${item.product_id} no encontrado`);
    }

    if (item.variation_id) {
      // Validar stock de variación
      const variation = await getVariationById(item.variation_id);
      if (variation.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name} (${variation.storage}, ${variation.color}). Disponible: ${variation.stock}, Solicitado: ${item.quantity}`);
      }
    } else {
      // Si no hay variation_id, usar primera variación
      const firstVariation = product.variations[0];
      if (!firstVariation || firstVariation.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${firstVariation?.stock ?? 0}, Solicitado: ${item.quantity}`);
      }
    }
  }

  // 2. Calcular totales
  const subtotal = checkoutData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = calculateShippingCost(checkoutData.shipping_address.country, checkoutData.shipping_speed);
  const totalAmount = subtotal + shippingCost;

  // 3. Crear pedido
  const order = await createOrder({
    user_id: checkoutData.user_id,
    order_number: `B2B-${Date.now().toString().slice(-6)}`,
    status: 'pending',
    total_amount: totalAmount,
    shipping_cost: shippingCost,
    shipping_type: checkoutData.shipping_type,
    shipping_country: checkoutData.shipping_address.country,
    shipping_speed: checkoutData.shipping_speed,
    payment_method: checkoutData.payment_method,
    shipping_info: checkoutData.shipping_address,
    notes: checkoutData.notes,
  });

  // 4. Crear items del pedido
  for (const item of checkoutData.items) {
    await createOrderItem({
      order_id: order.id,
      product_id: item.product_id,
      variation_id: item.variation_id,
      quantity: item.quantity,
      price: item.price,
    });
  }

  // 5. Actualizar stock de variaciones
  for (const item of checkoutData.items) {
    if (item.variation_id) {
      const variation = await getVariationById(item.variation_id);
      await updateVariation(item.variation_id, {
        stock: variation.stock - item.quantity
      });
    } else {
      // Si no hay variation_id, actualizar primera variación del producto
      const product = await getProduct(item.product_id);
      if (product && product.variations[0]) {
        await updateVariation(product.variations[0].id, {
          stock: product.variations[0].stock - item.quantity
        });
      }
    }
  }

  return { orderId: order.id, orderNumber: order.order_number };
}

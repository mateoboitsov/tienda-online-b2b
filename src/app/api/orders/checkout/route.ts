import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

export async function POST(request: Request) {
    try {
        const checkoutData = await request.json();
        const supabase = await createClient();

        // Verify session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const { items, shipping_address, shipping_type, shipping_speed, payment_method, notes } = checkoutData;

        // 1. Validate stock
        for (const item of items) {
            if (item.variation_id) {
                const { data: variation, error } = await supabase
                    .from('product_variations')
                    .select('stock_quantity')
                    .eq('id', item.variation_id)
                    .single();

                if (error || !variation) {
                    return NextResponse.json({ error: `Variación no encontrada` }, { status: 400 });
                }

                if (variation.stock_quantity < item.quantity) {
                    return NextResponse.json({ error: `Stock insuficiente para la variación seleccionada. Disponible: ${variation.stock_quantity}` }, { status: 400 });
                }
            }
        }

        // 2. Calculate totals
        const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        const shippingCost = calculateShippingCost(shipping_address.country, shipping_speed);
        const totalAmount = subtotal + shippingCost;

        // 3. Create order
        const orderNumber = `B2B-${Date.now().toString().slice(-6)}`;
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                order_number: orderNumber,
                status: 'pending',
                total_amount: totalAmount,
                shipping_cost: shippingCost,
                shipping_type,
                shipping_country: shipping_address.country,
                shipping_speed,
                payment_method,
                shipping_info: shipping_address,
                notes: notes || null,
            })
            .select()
            .single();

        if (orderError || !order) {
            console.error('Error creating order:', orderError);
            return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 });
        }

        // 4. Create order items
        for (const item of items) {
            let selected_storage = item.storage || '';
            let selected_color = item.color || '';
            let selected_condition = item.condition || '';

            if (item.variation_id && (!selected_storage || !selected_color)) {
                const { data: variation } = await supabase
                    .from('product_variations')
                    .select('storage, color, condition')
                    .eq('id', item.variation_id)
                    .single();
                if (variation) {
                    selected_storage = variation.storage;
                    selected_color = variation.color;
                    selected_condition = variation.condition;
                }
            }

            const { error: itemError } = await supabase
                .from('order_items')
                .insert({
                    order_id: order.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_price: item.price * item.quantity,
                    selected_storage,
                    selected_color,
                    selected_condition,
                });

            if (itemError) {
                console.error('Error creating order item:', itemError);
                // Don't abort - order was created, items might partially succeed
            }
        }

        // 5. Update stock (best effort)
        for (const item of items) {
            const variationId = item.variation_id;
            if (!variationId) continue;

            const { data: variation } = await supabase
                .from('product_variations')
                .select('stock_quantity')
                .eq('id', variationId)
                .single();

            if (variation) {
                await supabase
                    .from('product_variations')
                    .update({ stock_quantity: Math.max(0, variation.stock_quantity - item.quantity) })
                    .eq('id', variationId);
            }
        }

        return NextResponse.json({ ok: true, orderId: order.id, orderNumber: order.order_number });
    } catch (error) {
        console.error('Error in checkout API:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

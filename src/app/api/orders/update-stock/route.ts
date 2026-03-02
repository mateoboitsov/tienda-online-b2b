import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const { updates } = await request.json();
        const supabase = await createClient();

        for (const { variation_id, quantity } of updates) {
            // Get current stock
            const { data: variation, error: getError } = await supabase
                .from('product_variations')
                .select('stock_quantity')
                .eq('id', variation_id)
                .single();

            if (getError || !variation) continue;

            const newStock = Math.max(0, variation.stock_quantity - quantity);

            await supabase
                .from('product_variations')
                .update({ stock_quantity: newStock })
                .eq('id', variation_id);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error updating stock:', error);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}

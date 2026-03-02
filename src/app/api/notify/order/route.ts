import { NextResponse } from 'next/server';
import { sendOrderNotification, sendCustomerOrderConfirmation } from '@/lib/services/emailService';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Notificar al admin
        await sendOrderNotification(body);

        // 2. Confirmar al cliente con todos los detalles
        if (body.userEmail && body.userName) {
            await sendCustomerOrderConfirmation({
                orderNumber: body.orderNumber,
                name: body.userName,
                email: body.userEmail,
                totalAmount: body.totalAmount,
                shippingCost: body.shippingCost ?? 0,
                shippingSpeed: body.shippingSpeed ?? 'standard',
                shippingCountry: body.shippingCountry ?? '',
                paymentMethod: body.paymentMethod,
                shippingAddress: body.shippingAddress ?? {
                    address: '',
                    city: '',
                    postal_code: '',
                    country: body.shippingCountry ?? '',
                },
                items: body.items ?? [],
            });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error sending order emails:', error);
        return NextResponse.json({ ok: false, error: 'Error sending emails' }, { status: 500 });
    }
}

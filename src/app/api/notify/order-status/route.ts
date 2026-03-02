import { NextResponse } from 'next/server';
import { sendOrderStatusUpdate } from '@/lib/services/emailService';

export async function POST(request: Request) {
    try {
        const { name, email, orderNumber, newStatus, totalAmount } = await request.json();

        if (!email || !orderNumber || !newStatus) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Don't send email for 'pending' (initial state, already covered by confirmation)
        if (newStatus === 'pending') {
            return NextResponse.json({ ok: true, skipped: true });
        }

        await sendOrderStatusUpdate({ name, email, orderNumber, newStatus, totalAmount });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error sending status update email:', error);
        return NextResponse.json({ ok: false, error: 'Error sending email' }, { status: 500 });
    }
}

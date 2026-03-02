import { NextResponse } from 'next/server';
import { sendRegistrationNotification } from '@/lib/services/emailService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await sendRegistrationNotification(body);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error sending registration email:', error);
        return NextResponse.json({ ok: false, error: 'Error sending email' }, { status: 500 });
    }
}

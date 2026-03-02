import { NextResponse } from 'next/server';
import { sendContactNotification } from '@/lib/services/emailService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await sendContactNotification(body);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error sending contact email:', error);
        return NextResponse.json({ ok: false, error: 'Error sending email' }, { status: 500 });
    }
}

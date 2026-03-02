import { sendApprovalNotification } from '@/lib/services/emailService';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email } = body;

        if (!email || !name) {
            return NextResponse.json({ error: 'Missing information' }, { status: 400 });
        }

        await sendApprovalNotification({ name, email });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in approval notification API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

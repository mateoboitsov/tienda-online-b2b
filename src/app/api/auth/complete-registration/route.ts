import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, company, name, country, cif, address, city, postalCode, phone } = body;

        const supabase = await createClient();

        // Verify there's an active session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ ok: false, error: 'No active session' }, { status: 401 });
        }

        // Upsert user in public.users (in case a trigger didn't create it)
        const { error } = await supabase.from('users').upsert({
            id: user.id,
            email: email,
            company: company,
            name: name,
            country: country || 'España',
            cif: cif || null,
            address: address || null,
            city: city || null,
            postal_code: postalCode || null,
            phone: phone || null,
            approved: false,
            role: 'user',
        }, { onConflict: 'email' });

        if (error) {
            console.error('Error creating user in DB:', error);
            // Don't fail - user might already exist via trigger
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error completing registration:', error);
        return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
    }
}

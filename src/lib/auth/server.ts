import { createClient } from '@/lib/supabase/server';

export interface ServerUser {
    id: string;
    email: string;
    role: string;
    approved: boolean;
    company: string;
    name: string;
    cif?: string | null;
    address?: string | null;
    city?: string | null;
    postal_code?: string | null;
    country: string;
    phone?: string | null;
    business_email?: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Obtiene el usuario actual desde el servidor.
 * Úsalo en Server Components, Server Actions, o Route Handlers.
 * Retorna null si no hay sesión o si el usuario no está en la DB.
 */
export async function getServerUser(): Promise<ServerUser | null> {
    const supabase = await createClient();

    // 1. Verificar sesión de Supabase Auth
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser?.email) {
        return null;
    }

    // 2. Obtener datos completos de la DB
    const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();

    if (error || !dbUser) {
        return null;
    }

    return dbUser as ServerUser;
}

/**
 * Verifica si el usuario actual es admin.
 * Útil para proteger rutas o acciones de admin.
 */
export async function isUserAdmin(): Promise<boolean> {
    const user = await getServerUser();
    return user?.role === 'admin';
}

/**
 * Verifica si el usuario está aprobado.
 */
export async function isUserApproved(): Promise<boolean> {
    const user = await getServerUser();
    return user?.approved === true;
}

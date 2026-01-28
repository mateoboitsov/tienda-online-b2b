"use client";

import { createContext, useContext, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface User {
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  supabase: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider simplificado.
 * Solo maneja estado del cliente y acciones (login/logout).
 * Los datos vienen del servidor via props.
 */
export function AuthProvider({
  children,
  serverUser
}: {
  children: ReactNode;
  serverUser: User | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh(); // Re-fetch server data
  };

  const value = {
    user: serverUser,
    isAuthenticated: !!serverUser,
    isAdmin: serverUser?.role === 'admin',
    isApproved: serverUser?.approved === true,
    loading: false, // En esta arquitectura el servidor ya cargó los datos
    logout,
    supabase,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

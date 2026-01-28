import { DatabaseUser } from '../types/database';
import { createClient } from '../supabase/client';

export interface User {
  id: string;
  email: string;
  company: string;
  name: string;
  cif?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country: string;
  phone?: string | null;
  business_email?: string | null;
  approved: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UserApproval {
  id: string;
  email: string;
  company: string;
  name: string;
  approved: boolean;
  role: string;
  created_at: string;
}

export async function createUser(userData: Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .insert({
      ...userData,
      approved: false,
      role: userData.role ?? 'user',
      country: userData.country ?? 'España',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  return data as User;
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No encontrado
    }
    console.error('Error getting user:', error);
    throw error;
  }

  return data as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  console.log('🔎 [usersService] getUserByEmail llamado con:', email);
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.warn('⚠️ [usersService] Usuario no encontrado (PGRST116):', email);
      return null; // No encontrado
    }
    console.error('❌ [usersService] Error en getUserByEmail:', error);
    throw error;
  }

  console.log('✅ [usersService] Usuario encontrado:', data);
  return data as User;
}

export async function updateUser(id: string, updates: Partial<DatabaseUser>): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }

  return data as User;
}

export async function deleteUser(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting user:', error);
    throw error;
  }

  return true;
}

export async function getAllUsers(): Promise<User[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting all users:', error);
    throw error;
  }

  return (data || []) as User[];
}

export async function getPendingUsers(): Promise<User[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('approved', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting pending users:', error);
    throw error;
  }

  return (data || []) as User[];
}

export async function isUserApproved(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  return user?.approved ?? false;
}

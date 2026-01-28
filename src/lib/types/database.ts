// Tipos para las tablas de la base de datos
export interface DatabaseProduct {
  id: string
  name: string
  description: string | null
  brand: string
  model: string
  category: string
  region: string
  product_type: string
  condition: string
  storage: string
  color: string
  price: number
  stock_quantity: number
  in_stock: boolean
  battery_health: string | null
  active: boolean  // Para soft delete (ocultar productos en vez de eliminarlos)
  accessories: {
    caseWithCharger: boolean
    screenProtector: boolean
  } | null
  images: string[] | null
  created_at: string
  updated_at: string
}

export interface DatabaseUser {
  id: string
  email: string
  company: string
  name: string
  cif: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  country: string
  phone: string | null
  business_email: string | null
  approved: boolean
  role: string
  created_at: string
  updated_at: string
}

export interface DatabaseOrder {
  id: string
  user_id: string
  order_number: string
  status: string
  total_amount: number
  shipping_cost: number
  shipping_type: string
  shipping_country: string
  shipping_speed: string
  payment_method: string
  shipping_info: any
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DatabaseProductVariation {
  id: string
  product_id: string
  storage: string
  color: string
  condition: string
  product_type: string
  price: number
  stock_quantity: number
  created_at: string
}

// Interfaces legacy para compatibilidad con código existente (antes de Supabase)
export interface ProductVariation {
  id: string;
  storage: string;
  color: string;
  condition: 'NUEVO' | 'A+' | 'A' | 'B' | string;
  productType: 'NUEVO' | 'CPO' | 'ASIS' | 'REACONDICIONADO' | 'USADO' | string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  images: string[];
  category: string;
  variations: ProductVariation[];
  price?: number;
  inStock?: boolean;
  storage?: string;
  color?: string;
  condition?: any;
  productType?: any;
  accessories?: {
    screenProtector: boolean;
    caseWithCharger: boolean;
  };
}

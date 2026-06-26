import { DatabaseProduct } from '../types/database';
import { createClient } from '../supabase/client';
import { Product } from '../types/database';
import { getProductVariations } from './variationsService';
import { getMedusaProducts, getMedusaProduct } from './medusaProductsService';

// Obtener todos los productos con sus variaciones (desde Medusa)
export async function getProducts(): Promise<Product[]> {
  return getMedusaProducts();
}

// Obtener TODOS los productos (activos e inactivos) - Solo para admin (Supabase)
export async function getAllProductsForAdmin(): Promise<(Product & { active: boolean })[]> {
  const supabase = createClient();
  const { data: productsData, error } = await supabase
    .from('products')
    .select('*')
    .order('active', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting products:', error);
    throw error;
  }

  if (!productsData || productsData.length === 0) {
    return [];
  }

  const productsWithVariations = await Promise.all(
    (productsData || []).map(async (product: any) => {
      const variations = await getProductVariations(product.id);
      const mappedProduct: Product = {
        id: product.id,
        name: product.name,
        description: product.description || '',
        image: product.images?.[0] || '',
        images: product.images || [],
        category: product.category,
        brand: product.brand,
        model: product.model,
        region: product.region,
        variations,
        accessories: product.accessories,
      };
      return { ...mappedProduct, active: product.active ?? true };
    })
  );

  return productsWithVariations;
}

// Obtener un producto por ID (desde Medusa si es ID de Medusa, sino Supabase)
export async function getProduct(id: string): Promise<Product | null> {
  // Medusa product IDs start with "prod_"
  if (id.startsWith('prod_')) {
    return getMedusaProduct(id);
  }

  // Fallback: Supabase (legacy)
  const supabase = createClient();
  const { data: productData, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error getting product:', error);
    throw error;
  }

  const variations = await getProductVariations(id);
  return {
    id: productData.id,
    name: productData.name,
    description: productData.description || '',
    image: productData.images?.[0] || '',
    images: productData.images || [],
    category: productData.category,
    brand: productData.brand,
    model: productData.model,
    region: productData.region,
    variations,
    accessories: productData.accessories,
  };
}

// Crear producto base (sin variaciones - las variaciones se crean por separado)
export async function createProduct(productData: Partial<DatabaseProduct>): Promise<DatabaseProduct> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: productData.name ?? 'Nuevo producto',
      description: productData.description ?? '',
      brand: productData.brand ?? 'Marca',
      model: productData.model ?? 'Modelo',
      category: productData.category ?? 'General',
      region: productData.region ?? 'EU',
      product_type: productData.product_type ?? 'NUEVO',
      accessories: productData.accessories ?? null,
      images: productData.images ?? [],
      active: true,  // Productos nuevos están activos por defecto
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  // Mapear a DatabaseProduct completo (con campos que no están en la BD pero se usan en el código)
  return {
    ...data,
    condition: productData.condition ?? 'NUEVO',
    storage: productData.storage ?? '',
    color: productData.color ?? '',
    price: productData.price ?? 0,
    stock_quantity: productData.stock_quantity ?? 0,
    in_stock: (productData.stock_quantity ?? 0) > 0,
    battery_health: null,
  } as DatabaseProduct;
}

export async function updateProduct(id: string, updates: Partial<DatabaseProduct>): Promise<DatabaseProduct> {
  const supabase = createClient();
  // Separar campos que van a la tabla products de los que no
  const {
    condition,
    storage,
    color,
    price,
    stock_quantity,
    in_stock,
    battery_health,
    ...productUpdates
  } = updates;

  const { data, error } = await supabase
    .from('products')
    .update({
      ...productUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  // Retornar con los campos adicionales si existen
  return {
    ...data,
    condition: condition ?? 'NUEVO',
    storage: storage ?? '',
    color: color ?? '',
    price: price ?? 0,
    stock_quantity: stock_quantity ?? 0,
    in_stock: in_stock ?? false,
    battery_health: battery_health ?? null,
  } as DatabaseProduct;
}

// Soft delete: ocultar producto en vez de eliminarlo (evita problemas con foreign keys)
export async function deleteProduct(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('products')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error ocultando producto:', error);
    throw error;
  }
}

// Función para reactivar un producto oculto (opcional, por si lo necesitas)
export async function reactivateProduct(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('products')
    .update({ active: true, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error reactivando producto:', error);
    throw error;
  }
}

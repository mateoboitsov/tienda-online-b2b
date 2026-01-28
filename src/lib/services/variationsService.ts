import { ProductVariation } from '../types/database';
import { createClient } from '../supabase/client';



// Mapear de DatabaseProductVariation a ProductVariation
function mapToProductVariation(dbVariation: any): ProductVariation {
  return {
    id: dbVariation.id,
    storage: dbVariation.storage,
    color: dbVariation.color,
    condition: dbVariation.condition as 'NUEVO' | 'A+' | 'A' | 'B',
    productType: dbVariation.product_type as 'NUEVO' | 'CPO' | 'ASIS' | 'REACONDICIONADO' | 'USADO',
    price: Number(dbVariation.price),
    priceBulk: dbVariation.price_bulk ? Number(dbVariation.price_bulk) : null,
    stock: dbVariation.stock_quantity,
    packaging: dbVariation.packaging as 'Original Box' | 'Standard' | null,
  };
}

// Obtener todas las variaciones de un producto
export async function getProductVariations(productId: string): Promise<ProductVariation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('product_variations')
    .select('*')
    .eq('product_id', productId);

  if (error) {
    console.error('Error getting product variations:', error);
    throw error;
  }

  return (data || []).map(mapToProductVariation);
}

// Obtener una variación por ID
export async function getVariationById(id: string): Promise<ProductVariation> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('product_variations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error getting variation:', error);
    throw new Error('Variación no encontrada');
  }

  return mapToProductVariation(data);
}

// Crear nueva variación
export async function createVariation(
  productId: string,
  variationData: Partial<ProductVariation>
): Promise<ProductVariation> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('product_variations')
    .insert({
      product_id: productId,
      storage: variationData.storage ?? '128GB',
      color: variationData.color ?? 'Negro',
      condition: variationData.condition ?? 'A+',
      product_type: variationData.productType ?? 'CPO',
      price: variationData.price ?? 0,
      price_bulk: variationData.priceBulk ?? null,
      stock_quantity: variationData.stock ?? 0,
      packaging: variationData.packaging ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating variation:', error);
    throw error;
  }

  return mapToProductVariation(data);
}

// Actualizar variación
export async function updateVariation(
  id: string,
  updates: Partial<ProductVariation>
): Promise<ProductVariation> {
  const supabase = createClient();
  const updateData: any = {};

  if (updates.storage !== undefined) updateData.storage = updates.storage;
  if (updates.color !== undefined) updateData.color = updates.color;
  if (updates.condition !== undefined) updateData.condition = updates.condition;
  if (updates.productType !== undefined) updateData.product_type = updates.productType;
  if (updates.price !== undefined) updateData.price = updates.price;
  if (updates.priceBulk !== undefined) updateData.price_bulk = updates.priceBulk;
  if (updates.stock !== undefined) updateData.stock_quantity = updates.stock;
  if (updates.packaging !== undefined) updateData.packaging = updates.packaging;

  const { data, error } = await supabase
    .from('product_variations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating variation:', error);
    throw error;
  }

  return mapToProductVariation(data);
}

// Eliminar variación
export async function deleteVariation(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('product_variations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting variation:', error);
    throw error;
  }
}

// Funciones auxiliares simples (opcionales, para compatibilidad)
export async function getAvailableOptions(productId: string): Promise<{
  storages: string[];
  colors: string[];
  conditions: string[];
  priceRange: { min: number; max: number };
  productTypes: string[];
}> {
  const variations = await getProductVariations(productId);
  const storages = Array.from(new Set(variations.map((v) => v.storage)));
  const colors = Array.from(new Set(variations.map((v) => v.color)));
  const conditions = Array.from(new Set(variations.map((v) => v.condition)));
  const productTypes = Array.from(new Set(variations.map((v) => v.productType)));
  const prices = variations.map((v) => v.price);

  return {
    storages,
    colors,
    conditions,
    priceRange: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    },
    productTypes,
  };
}

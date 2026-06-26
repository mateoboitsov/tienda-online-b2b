import { medusaFetch, MEDUSA_REGION_ID } from '@/lib/medusa/client';
import { MedusaProduct, MedusaVariant } from '@/lib/medusa/types';
import { Product, ProductVariation } from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';

// Fetch stock data from Supabase keyed by medusa_variant_id
async function getStockData(): Promise<Map<string, { id: string; stock: number; packaging: string | null }>> {
  const supabase = createClient();
  const { data } = await supabase
    .from('product_variations')
    .select('id, medusa_variant_id, stock_quantity, packaging')
    .not('medusa_variant_id', 'is', null);

  const map = new Map<string, { id: string; stock: number; packaging: string | null }>();
  for (const row of data ?? []) {
    if (row.medusa_variant_id) {
      map.set(row.medusa_variant_id, {
        id: row.id,
        stock: row.stock_quantity,
        packaging: row.packaging,
      });
    }
  }
  return map;
}

function getOptionValue(variant: MedusaVariant, optionTitle: string, options: MedusaProduct['options']): string {
  const option = options.find((o) => o.title.toLowerCase() === optionTitle.toLowerCase());
  if (!option) return '';
  const variantOpt = variant.options.find((o) => o.option_id === option.id);
  return variantOpt?.value ?? '';
}

function mapCondition(estado: string): ProductVariation['condition'] {
  const s = estado.toLowerCase();
  if (s === 'nuevo') return 'NUEVO';
  if (s === 'reacondicionado') return 'A+';
  if (s === 'como nuevo') return 'A+';
  if (s === 'bueno') return 'A';
  if (s === 'aceptable') return 'B';
  return estado as ProductVariation['condition'];
}

function mapProductType(estado: string): ProductVariation['productType'] {
  const s = estado.toLowerCase();
  if (s === 'nuevo') return 'NUEVO';
  return 'CPO';
}

function mapMedusaVariant(
  variant: MedusaVariant,
  options: MedusaProduct['options'],
  stockData: Map<string, { id: string; stock: number; packaging: string | null }>
): ProductVariation {
  const storage = getOptionValue(variant, 'capacidad', options) || getOptionValue(variant, 'storage', options);
  const color = getOptionValue(variant, 'color', options);
  const estado = getOptionValue(variant, 'estado', options) || getOptionValue(variant, 'condition', options);

  const stock = stockData.get(variant.id);
  // Price comes from Medusa calculated_price. With versaltech pointed at the
  // dedicated B2B region, this resolves to the wholesale price. Medusa v2
  // amounts are already in the main currency unit (euros), not cents.
  const amount = variant.calculated_price?.calculated_amount ?? null;
  const price = amount != null ? amount : 0;

  return {
    id: stock?.id ?? variant.id,
    storage,
    color,
    condition: mapCondition(estado),
    productType: mapProductType(estado),
    price,
    priceBulk: null,
    stock: stock?.stock ?? 0,
    packaging: (stock?.packaging as ProductVariation['packaging']) ?? null,
  };
}

function mapMedusaProduct(
  medusaProduct: MedusaProduct,
  stockData: Map<string, { id: string; stock: number; packaging: string | null }>
): Product {
  const variations = medusaProduct.variants.map((v) =>
    mapMedusaVariant(v, medusaProduct.options, stockData)
  );

  const images = medusaProduct.images.length > 0
    ? medusaProduct.images.sort((a, b) => a.rank - b.rank).map((i) => i.url)
    : medusaProduct.thumbnail ? [medusaProduct.thumbnail] : [];

  return {
    id: medusaProduct.id,
    name: medusaProduct.title,
    description: medusaProduct.description ?? '',
    image: images[0] ?? '',
    images,
    category: (medusaProduct.metadata?.category as string) ?? 'Smartphones',
    brand: (medusaProduct.metadata?.brand as string) ?? 'Apple',
    model: (medusaProduct.metadata?.model as string) ?? medusaProduct.title,
    region: (medusaProduct.metadata?.region as string) ?? 'EU',
    variations,
    accessories: (medusaProduct.metadata?.accessories as Product['accessories']) ?? undefined,
  };
}

export async function getMedusaProducts(): Promise<Product[]> {
  const regionParam = MEDUSA_REGION_ID ? `&region_id=${MEDUSA_REGION_ID}` : '';

  const [{ products }, stockData] = await Promise.all([
    medusaFetch<{ products: MedusaProduct[] }>(
      `/store/products?limit=100${regionParam}`
    ),
    getStockData(),
  ]);

  const iPhoneProducts = products.filter((p) =>
    p.title.toLowerCase().includes('iphone') ||
    (p.metadata?.category as string)?.toLowerCase().includes('smartphone')
  );

  return iPhoneProducts.map((p) => mapMedusaProduct(p, stockData));
}

export async function getMedusaProduct(medusaProductId: string): Promise<Product | null> {
  const regionParam = MEDUSA_REGION_ID ? `&region_id=${MEDUSA_REGION_ID}` : '';

  const [{ products }, stockData] = await Promise.all([
    medusaFetch<{ products: MedusaProduct[] }>(
      `/store/products?id=${medusaProductId}${regionParam}`
    ),
    getStockData(),
  ]);

  if (!products.length) return null;
  return mapMedusaProduct(products[0], stockData);
}

export async function getMedusaProductByHandle(handle: string): Promise<Product | null> {
  const regionParam = MEDUSA_REGION_ID ? `&region_id=${MEDUSA_REGION_ID}` : '';

  const [{ products }, stockData] = await Promise.all([
    medusaFetch<{ products: MedusaProduct[] }>(
      `/store/products?handle=${handle}${regionParam}`
    ),
    getStockData(),
  ]);

  if (!products.length) return null;
  return mapMedusaProduct(products[0], stockData);
}

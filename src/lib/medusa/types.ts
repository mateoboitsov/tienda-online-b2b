export interface MedusaOptionValue {
  id: string;
  value: string;
  option_id: string;
}

export interface MedusaOption {
  id: string;
  title: string;
  values: MedusaOptionValue[];
}

export interface MedusaVariantOption {
  id: string;
  value: string;
  option_id: string;
}

export interface MedusaVariant {
  id: string;
  title: string;
  sku: string | null;
  allow_backorder: boolean;
  manage_inventory: boolean;
  metadata: Record<string, unknown> | null;
  options: MedusaVariantOption[];
  calculated_price: {
    calculated_amount: number | null;
    is_calculated_price_price_list: boolean | null;
    currency_code: string;
  } | null;
}

export interface MedusaImage {
  id: string;
  url: string;
  rank: number;
}

export interface MedusaProduct {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  handle: string;
  thumbnail: string | null;
  metadata: Record<string, unknown> | null;
  options: MedusaOption[];
  variants: MedusaVariant[];
  images: MedusaImage[];
}

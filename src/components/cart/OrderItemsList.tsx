"use client";

import { useState, useEffect } from "react";
import { OrderItem } from "@/lib/services/ordersService";
import { getProduct } from "@/lib/services/productsService";
import { getVariationById } from "@/lib/services/variationsService";
import { ProductVariation } from "@/lib/types/database";

interface OrderItemsListProps {
  items: OrderItem[];
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  const [itemsWithDetails, setItemsWithDetails] = useState<Array<{
    item: OrderItem;
    productName: string;
    variation: ProductVariation | null;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const details = await Promise.all(
          items.map(async (item) => {
            const product = await getProduct(item.product_id);
            let variation: ProductVariation | null = null;

            // variation_id podría no estar en la interfaz pero sí en el objeto real de la DB
            const varId = (item as any).variation_id;
            if (varId) {
              try {
                variation = await getVariationById(varId);
              } catch (e) {
                // Variación no encontrada
              }
            }

            return {
              item,
              productName: product?.name || 'Producto no encontrado',
              variation,
            };
          })
        );
        setItemsWithDetails(details);
      } catch (error) {
        console.error('Error cargando detalles de items:', error);
      } finally {
        setLoading(false);
      }
    };

    if (items.length > 0) {
      loadItems();
    } else {
      setLoading(false);
    }
  }, [items]);

  if (loading) {
    return (
      <div>
        <h4 className="font-semibold mb-3">Productos</h4>
        <div className="text-center py-4 text-gray-500">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-semibold mb-3">Productos</h4>
      <div className="space-y-2">
        {itemsWithDetails.map(({ item, productName, variation }) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">{productName}</p>
              {(variation || item.selected_storage || item.selected_color || item.selected_condition) && (
                <p className="text-sm text-gray-600">
                  {variation
                    ? `${variation.storage} • ${variation.color} • ${variation.condition}`
                    : [item.selected_storage, item.selected_color, item.selected_condition].filter(Boolean).join(' • ')
                  }
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium">€{(item.unit_price || 0).toFixed(2)}</p>
              <p className="text-sm text-gray-600">x{item.quantity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Checkout } from "@/components/cart/Checkout";
import { OrderConfirmation } from "@/components/cart/OrderConfirmation";
import { useCart } from "@/contexts/CartContext";
import { ApprovalRequired } from "@/components/auth/ApprovalRequired";

type CheckoutState = "checkout" | "confirmation";

export default function CheckoutPage() {
  const [currentState, setCurrentState] = useState<CheckoutState>("checkout");
  const [shippingType, setShippingType] = useState<"business" | "customer">("business");
  const [shippingInfo, setShippingInfo] = useState<any>({});
  const [orderNumber, setOrderNumber] = useState("");
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: number }>({});
  const { state } = useCart();
  const router = useRouter();

  const handleCheckoutComplete = (shippingData: any) => {
    setShippingType(shippingData.shippingType);
    setShippingInfo(shippingData.shippingInfo);
    // Usar el orderNumber del servicio si está disponible, sino generar uno
    setOrderNumber(shippingData.orderNumber || `B2B-${Date.now().toString().slice(-6)}`);
    // Guardar los items del pedido antes de que se limpie el carrito
    setOrderItems(shippingData.orderItems || []);
    setSelectedProducts(shippingData.selectedProducts || {});
    setCurrentState("confirmation");
  };

  const handleBackToStore = () => {
    router.push('/productos');
  };

  const handleBackToCheckout = () => {
    setCurrentState("checkout");
  };

  if (currentState === "confirmation") {
    // Usar los items guardados del pedido en lugar del carrito (que ya está vacío)
    const productsToShow = orderItems.length > 0 
      ? orderItems.map(item => ({
          id: item.uniqueId,
          name: item.name,
          price: item.price || 0,
          description: item.description,
          category: item.category,
          inStock: item.inStock,
          storage: item.storage,
          color: item.color,
          condition: item.condition
        }))
      : state.items.map(item => ({
          id: item.uniqueId,
          name: item.name,
          price: item.price || 0,
          description: item.description,
          category: item.category,
          inStock: item.inStock,
          storage: item.storage,
          color: item.color,
          condition: item.condition
        }));

    const selectedProductsToShow = Object.keys(selectedProducts).length > 0
      ? selectedProducts
      : state.items.reduce((acc, item) => {
          acc[item.uniqueId] = item.quantity;
          return acc;
        }, {} as { [key: string]: number });

    return (
      <ApprovalRequired>
        <Header />
        <div className="pt-20">
          <OrderConfirmation
            orderNumber={orderNumber}
            selectedProducts={selectedProductsToShow}
            products={productsToShow}
            shippingType={shippingType}
            shippingInfo={shippingInfo}
            onBackToStore={handleBackToStore}
          />
        </div>
      </ApprovalRequired>
    );
  }

  return (
    <ApprovalRequired>
      <Header />
      <div className="pt-20">
        <Checkout
          selectedProducts={state.items.reduce((acc, item) => {
            acc[item.uniqueId] = item.quantity;
            return acc;
          }, {} as { [key: string]: number })}
          products={state.items.map(item => ({
            id: item.uniqueId,
            name: item.name,
            price: item.price,
            description: item.description,
            category: item.category,
            inStock: item.inStock,
            storage: item.storage,
            color: item.color,
            condition: item.condition
          }))}
          onBack={handleBackToStore}
          onComplete={handleCheckoutComplete}
        />
      </div>
    </ApprovalRequired>
  );
}

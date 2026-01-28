"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ProductsSection } from "@/components/product/ProductsSection";

export default function ProductosPage() {
  const router = useRouter();

  const handleProceedToCheckout = () => {
    router.push('/checkout');
  };

  return (
    <>
      <Header />
      <div className="pt-20">
        <ProductsSection 
          onProceedToCheckout={handleProceedToCheckout}
        />
      </div>
    </>
  );
}

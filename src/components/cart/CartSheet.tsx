"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingCart, Plus, Minus, Building2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Input } from "@/components/ui/input";

export function CartSheet() {
  const { state, dispatch } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Detectar si estamos en la página de productos B2B
  const isB2BPage = pathname === "/productos";

  // Evitar problemas de hidratación - solo mostrar badge después de montar
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleQuantityChange = (uniqueId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: uniqueId, quantity } });
  };

  const handleRemoveItem = (uniqueId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: uniqueId });
  };


  const handleCheckout = () => {
    setIsOpen(false);
    // Redirigir al checkout B2B
    router.push('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="text-highlight-wa bg-brand-white border-1 rounded-full hover:scale-110 hover:rotate-12 transition-all duration-300 cursor-pointer gap-1 p-2 relative">
          <ShoppingCart className="h-6 w-6 text-neutral-900" />
          {mounted && state.itemCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {state.itemCount}
            </Badge>
          )}
        </div>
      </SheetTrigger>
      <SheetContent className="w-[540px] sm:w-[540px] sm:max-w-[540px] max-w-[540px]">
        <SheetHeader className="pb-0">
          <SheetTitle>
            {isB2BPage ? "Carrito B2B" : "Carrito de Compras"}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col">
          {state.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tu carrito está vacío</h3>
              <p className="text-muted-foreground mb-4">
                Agrega algunos productos para comenzar
              </p>
              <Button onClick={() => setIsOpen(false)} className="cursor-pointer">
                Continuar Comprando
              </Button>
            </div>
          ) : (
            <>
              {/* Área de productos con scroll - altura ajustable */}
              <div className="overflow-y-auto py-4 px-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.uniqueId} className="flex items-center space-x-2 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base truncate">{item.name}</p>
                        {/* Mostrar especificaciones */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.storage}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.color}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Grado {item.condition}
                          </Badge>
                        </div>
                        <p className="text-base font-bold text-primary mt-2">€{item.price ? item.price.toFixed(2) : '0.00'}</p>
                      </div>
                      
                      <div className="flex items-center space-x-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 cursor-pointer"
                          onClick={() => handleQuantityChange(item.uniqueId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            handleQuantityChange(item.uniqueId, newQuantity);
                          }}
                          className="w-12 h-6 text-center text-sm border-0 focus:ring-0 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 cursor-pointer"
                          onClick={() => handleQuantityChange(item.uniqueId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive cursor-pointer"
                        onClick={() => handleRemoveItem(item.uniqueId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Resumen de la compra - siempre visible */}
              <div className="border-t pt-4 space-y-4 px-4 bg-white">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-2xl text-primary">€{state.total ? state.total.toFixed(2) : '0.00'}</span>
                </div>                
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 cursor-pointer"
                    onClick={() => dispatch({ type: "CLEAR_CART" })}
                  >
                    Vaciar Carrito
                  </Button>
                  {isB2BPage ? (
                    <Button 
                      className="flex-1 bg-brand-green hover:bg-brand-green/80 cursor-pointer" 
                      onClick={handleCheckout}
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Checkout B2B
                    </Button>
                  ) : (
                    <Button className="flex-1 cursor-pointer" onClick={handleCheckout}>
                      Proceder al Pago
                    </Button>
                  )}
                </div>
                
                
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { Product } from "@/lib/types/database";
import { useAuth } from "@/contexts/AuthContext";

interface CartItem extends Product {
  quantity: number;
  uniqueId: string; // Identificador único para cada configuración
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

// Clave para localStorage
const CART_STORAGE_KEY = "versaltech_cart";

// Función para cargar el carrito desde localStorage
function loadCartFromStorage(): CartState {
  if (typeof window === "undefined") {
    return { items: [], total: 0, itemCount: 0 };
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validar que tenga la estructura correcta
      if (parsed.items && Array.isArray(parsed.items)) {
        return {
          items: parsed.items,
          total: parsed.total || 0,
          itemCount: parsed.itemCount || 0,
        };
      }
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }

  return { items: [], total: 0, itemCount: 0 };
}

// Función para guardar el carrito en localStorage
function saveCartToStorage(state: CartState) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      // Crear un identificador único basado en id + configuración
      const uniqueId = `${action.payload.id}-${action.payload.storage}-${action.payload.color}-${action.payload.condition}`;

      const existingItem = state.items.find(item => item.uniqueId === uniqueId);

      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.uniqueId === uniqueId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );

        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        };
      } else {
        const newItem = { ...action.payload, quantity: 1, uniqueId };
        const newItems = [...state.items, newItem];

        return {
          ...state,
          items: newItems,
          total: newItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0),
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        };
      }
    }

    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter(item => item.uniqueId !== action.payload);

      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    }

    case "UPDATE_QUANTITY": {
      const updatedItems = state.items.map(item =>
        item.uniqueId === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);

      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
      };

    case "LOAD_CART":
      return action.payload;

    default:
      return state;
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  // Inicializar el estado desde localStorage
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, itemCount: 0 });

  // Cargar el carrito desde localStorage al montar el componente O cuando cambie el usuario
  useEffect(() => {
    // Si no está autenticado, podríamos querer limpiar el carrito o dejarlo (depende del negocio)
    // Para B2B, mejor que cada usuario tenga su carrito.
    const userSuffix = user?.id ? `_${user.id}` : '';
    const storageKey = `${CART_STORAGE_KEY}${userSuffix}`;

    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        dispatch({ type: "LOAD_CART", payload: parsed });
      } catch (e) {
        console.error("Error parsing cart", e);
      }
    } else {
      // Si no hay nada para este usuario específico, empezar de cero
      dispatch({ type: "CLEAR_CART" });
    }
  }, [user?.id]);

  // Guardar el carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userSuffix = user?.id ? `_${user.id}` : '';
      const storageKey = `${CART_STORAGE_KEY}${userSuffix}`;
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, user?.id]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

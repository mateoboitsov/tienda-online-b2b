"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Package, Users, Home, LogOut, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3 md:gap-0 items-center justify-between">
        {/* Logo/Nombre */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>

        {/* Navegación */}
        <div className="flex flex-col md:flex-row gap-1 md:gap-0 items-center space-x-2">
          <Button
            onClick={() => router.push('/admin')}
            variant={isActive('/admin') ? 'default' : 'ghost'}
            size="sm"
          >
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Button>

          <Button
            onClick={() => router.push('/admin/productos')}
            variant={isActive('/admin/productos') ? 'default' : 'ghost'}
            size="sm"
          >
            <Package className="h-4 w-4 mr-2" />
            Productos
          </Button>

          <Button
            onClick={() => router.push('/admin/usuarios')}
            variant={isActive('/admin/usuarios') ? 'default' : 'ghost'}
            size="sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Usuarios
          </Button>

          <Button
            onClick={() => router.push('/admin/pedidos')}
            variant={isActive('/admin/pedidos') ? 'default' : 'ghost'}
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Pedidos
          </Button>
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            size="sm"
          >
            Volver a la Tienda
          </Button>


        </div>
      </div>
    </nav>
  );
}

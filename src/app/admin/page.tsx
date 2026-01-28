"use client";

import { Button } from "@/components/ui/button";
import { Package, Users, Home, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  // Sin protección: el panel ahora está accesible directamente
  const router = useRouter();
  const user = {
    id: "demo-admin",
    email: "admin@versaltech.com",
    role: "admin",
    emailConfirmed: true,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Panel de Administración
          </h1>
          <p className="text-xl text-gray-600">
            Bienvenido, {user.email}
          </p>
        </div>

        {/* Información del usuario */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de tu cuenta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>ID:</strong> {user.id}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Rol:</strong> {user.role}</div>
            <div><strong>Email Confirmado:</strong> {user.emailConfirmed ? '✅ Sí' : '❌ No'}</div>
          </div>
        </div>

        {/* Navegación principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Button
            onClick={() => router.push('/admin/productos')}
            className="h-32 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold p-6"
          >
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto mb-3" />
              <div>Gestionar Productos</div>
              <div className="text-sm opacity-80 mt-1">Añadir, editar y eliminar productos</div>
            </div>
          </Button>

          <Button
            onClick={() => router.push('/admin/usuarios')}
            className="h-32 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold p-6"
          >
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-3" />
              <div>Gestionar Usuarios</div>
              <div className="text-sm opacity-80 mt-1">Aprobar y gestionar usuarios</div>
            </div>
          </Button>

          <Button
            onClick={() => router.push('/admin/pedidos')}
            className="h-32 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold p-6"
          >
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3" />
              <div>Gestionar Pedidos</div>
              <div className="text-sm opacity-80 mt-1">Ver y actualizar estado de pedidos</div>
            </div>
          </Button>
        </div>

        {/* Botón de regreso */}
        <div className="text-center">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="bg-white hover:bg-gray-50"
          >
            <Home className="h-4 w-4 mr-2" />
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
}

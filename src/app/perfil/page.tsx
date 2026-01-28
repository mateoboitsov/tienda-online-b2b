import { Header } from "@/components/layout/Header";
import { SimpleProfile } from "@/components/auth/SimpleProfile";
import { OrderHistory } from "@/components/cart/OrderHistory";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getServerUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { ApprovalRequired } from "@/components/auth/ApprovalRequired";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default async function PerfilPage({
  searchParams
}: {
  searchParams: { message?: string }
}) {
  const user = await getServerUser();
  const message = searchParams.message;

  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <Header />
      <ApprovalRequired>
        <section className="min-h-screen bg-gradient-to-br from-brand-white via-brand-gray to-brand-white py-20 mt-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Mensaje de estado de aprobación */}
              {message && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800">
                    <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">{message}</span>
                  </div>
                  <p className="text-sm text-orange-700 mt-2">
                    Tu cuenta está siendo revisada por nuestro equipo. Recibirás una notificación cuando sea aprobada.
                  </p>
                </div>
              )}

              {/* Botón de regreso */}
              <div className="mb-6">
                <Link href="/productos">
                  <Button
                    variant="ghost"
                    className="text-brand-black hover:text-brand-green hover:bg-brand-green/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a la Tienda
                  </Button>
                </Link>
              </div>

              {/* Tabs para Perfil e Historial de Pedidos */}
              <Tabs defaultValue="orders" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
                  <TabsTrigger value="orders">Mis Pedidos</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <SimpleProfile />
                </TabsContent>

                <TabsContent value="orders">
                  <OrderHistory userId={user.id} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </ApprovalRequired>
    </>
  );
}

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { GlobalAnimations } from "@/components/common/GlobalAnimations";
import { getServerUser } from "@/lib/auth/server";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "TechStore - Tienda Online B2B",
  description: "Tu proveedor confiable de tecnología para empresas",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Obtener usuario desde el servidor (sin race conditions)
  const serverUser = await getServerUser();

  return (
    <html lang="es">
      <body
        className={`${poppins.variable} antialiased`}
      >
        <GlobalAnimations />
        <AuthProvider serverUser={serverUser}>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

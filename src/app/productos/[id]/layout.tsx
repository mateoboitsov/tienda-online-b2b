import { Metadata } from "next";

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductLayoutProps): Promise<Metadata> {
  // En un caso real, aquí obtendrías los datos del producto desde una API
  const { id } = await params;
  return {
    title: `Producto ${id} - Tienda Online B2B`,
    description: "Descubre nuestros productos de tecnología con la mejor calidad y garantía oficial.",
  };
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return <>{children}</>;
}

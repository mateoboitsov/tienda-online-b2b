import { getServerUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { AdminNavbar } from "@/components/layout/AdminNavbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();

  if (!user) {
    redirect('/login?redirectedFrom=/admin');
  }

  if (user.role !== 'admin') {
    redirect('/productos');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}

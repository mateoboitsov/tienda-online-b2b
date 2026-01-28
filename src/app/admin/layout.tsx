"use client";

import { AdminNavbar } from "@/components/layout/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}

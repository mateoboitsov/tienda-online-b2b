"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ApprovalRequiredProps {
  children: React.ReactNode;
}

export function ApprovalRequired({ children }: ApprovalRequiredProps) {
  const { user, isApproved, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !isApproved) {
      router.push('/perfil?message=Tu cuenta está pendiente de aprobación');
    }
  }, [user, isApproved, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (user && !isApproved) {
    return null; // O un mensaje de "Pendiente"
  }

  return <>{children}</>;
}

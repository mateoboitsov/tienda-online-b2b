"use client";

import { useAuth } from "@/contexts/AuthContext";

import { useState } from "react";

export function AuthDebug() {
  const { user, isAuthenticated, isAdmin, isApproved, loading } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  if (process.env.NODE_ENV === 'production' || !isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 border border-gray-700 text-white p-3 rounded-xl text-[10px] font-mono z-50 shadow-2xl backdrop-blur-md bg-opacity-80">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span className="font-bold uppercase tracking-wider">Auth Monitor</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-gray-700 hover:bg-gray-600 p-1 rounded transition-colors"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div><strong>Status:</strong> {loading ? '⏳' : '✅'}</div>
        <div><strong>Admin:</strong> {isAdmin ? '👑 SI' : '👤 NO'}</div>
        <div><strong>Aprobado:</strong> {isApproved ? '✅ SI' : '⏳ NO'}</div>
        <div><strong>ID Corto:</strong> {user?.id.slice(0, 8)}...</div>
      </div>

      {isExpanded && user && (
        <div className="mt-3 pt-3 border-t border-gray-700 space-y-1 overflow-x-auto">
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Empresa:</strong> {user.company}</div>
          <div><strong>Nombre:</strong> {user.name}</div>
          <div><strong>País:</strong> {user.country}</div>
          <div><strong>Role:</strong> {user.role}</div>
        </div>
      )}
    </div>
  );
}

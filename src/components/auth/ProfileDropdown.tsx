"use client";

import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, Building2, Shield, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function ProfileDropdown({ position = "bottom" }: { position?: "top" | "bottom" }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{ name?: string; company?: string } | null>(null);

  // Cargar datos del perfil del usuario
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUserProfile({ name: parsed.name || '', company: parsed.company || '' });
          }
        } catch (error) {
          console.error('Error cargando perfil:', error);
        }
      }
    };

    loadUserProfile();
  }, [user?.id]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center hover:scale-110 hover:rotate-12 transition-all duration-300 cursor-pointer relative"
      >
        <User className="h-6 w-6 text-neutral-900" />

        {/* Indicador visual de estado de aprobación */}
        {user && !user.approved && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
            <Clock className="h-2.5 w-2.5 text-white" />
          </div>
        )}
        {user && user.approved && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-2.5 w-2.5 text-white" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className={`absolute left-1/2 -translate-x-1/2 md:right-0 ${position === "top" ? "bottom-full mb-2" : "mt-2"} w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200`}>
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {userProfile?.name || 'Usuario'}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
            {userProfile?.company && (
              <p className="text-sm text-gray-500">{userProfile.company}</p>
            )}
            {isAdmin && (
              <div className="flex items-center mt-1">
                <Shield className="w-3 h-3 text-brand-green mr-1" />
                <span className="text-xs text-brand-green font-medium">Administrador</span>
              </div>
            )}
          </div>

          <Link
            href="/perfil"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Mi Perfil
            </div>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Administración
              </div>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
          >
            <div className="flex items-center">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

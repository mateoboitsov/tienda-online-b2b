"use client";

import { CartSheet } from "@/components/cart/CartSheet";
import { ChevronDown, User, Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileDropdown } from "@/components/auth/ProfileDropdown";


// Array de navegación - fácil de editar
const navigationItems = [
  { name: "Inicio", href: "/" },
  { name: "Nosotros", href: "/sobre-nosotros" },
  { name: "Productos", href: "/productos" },
  { name: "Cómo trabajamos", href: "/#como-trabajamos" },
  { name: "Preguntas frecuentes", href: "/#preguntas-frecuentes" },
  { name: "Contacto", href: "/#contacto" },
];

// Array de idiomas - fácil de editar
const languages = [
  { code: "ES", name: "Español", flag: "🇪🇸" },
  { code: "EN", name: "English", flag: "🇺🇸" },
  { code: "DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "PT", name: "Português", flag: "🇵🇹" }
];

export function Header() {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("ES");
  const pathname = usePathname();
  // const searchParams = useSearchParams(); // Comentado temporalmente para build
  const { isAuthenticated, user, logout } = useAuth();

  // Detectar si estamos en checkout
  const isInCheckout = false; // pathname === "/productos" && searchParams.get('checkout') === 'true';

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setIsLanguageOpen(false);
  };

  // Función para manejar el scroll suave en enlaces internos
  const handleSmoothScroll = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  // Función para manejar el clic en "Tienda B2B"
  const handleTiendaB2BClick = (e: React.MouseEvent, href: string) => {
    if (href === "/productos" && isInCheckout) {
      e.preventDefault();
      // Si estamos en checkout, volver a la tienda
      window.location.href = "/productos";
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-4 sm:px-10 py-4 sm:py-5 inline-flex justify-between items-center mx-auto">
          {/* Burger Menu - Solo móvil */}
          <button
            className="xl:hidden p-2 -ml-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-neutral-900" />
            ) : (
              <Menu className="h-6 w-6 text-neutral-900" />
            )}
          </button>

          {/* Logo */}
          <div className="h-6 sm:h-8 flex items-center justify-center">
            <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
          </div>

          {/* Menú de navegación - Solo desktop */}
          <nav className="hidden xl:flex items-center gap-6">
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="text-xs"
                onClick={(e) => {
                  const isAnchor = item.href.includes('#');
                  const isSamePage = pathname === '/' || pathname === '';
                  if (isAnchor && isSamePage) {
                    e.preventDefault();
                    const hash = item.href.substring(item.href.indexOf('#'));
                    handleSmoothScroll(hash);
                  }
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Controles móvil - Solo carrito */}
          <div className="xl:hidden">
            <CartSheet />
          </div>

          {/* Información de contacto y controles - Solo desktop */}
          <div className="hidden xl:flex justify-start items-center gap-2">
            {/* Teléfono */}
            <div className="text-right justify-start text-neutral-900 text-[16px] font-semibold font-['Poppins'] leading-none tracking-[-0.64px] hover:text-brand-green transition-colors duration-200 cursor-pointer">
              +351 928399390
            </div>

            {/* WhatsApp */}
            <div className="text-highlight-wa hover:scale-110 hover:rotate-12 transition-all duration-300 cursor-pointer">
              <a
                href="https://wa.me/351928399390"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/WA_Logo.svg" alt="whatsapp" className="w-6 h-6" style={{ transform: 'none' }} />
              </a>
            </div>

            {/* Carrito - posición más prominente */}
            <CartSheet />

            {/* Perfil del usuario */}
            {isAuthenticated ? (
              <div className="text-highlight-wa bg-brand-white border-1 rounded-full cursor-pointer gap-1 p-2">
                <ProfileDropdown />
              </div>
            ) : (
              <Link href="/login">
                <div className="text-highlight-wa bg-brand-white border-1 rounded-full hover:scale-110 hover:rotate-12 transition-all duration-300 cursor-pointer gap-1 p-2">
                  <User className="h-6 w-6 text-neutral-900" />
                </div>
              </Link>
            )}

            {/* Selector de idioma */}
            <div className="relative">
              <div
                className="text-highlight-wa bg-brand-white border-1 rounded-full hover:scale-110 hover:rotate-12 transition-all duration-300 cursor-pointer flex items-center gap-2 px-3 py-2"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              >
                <span className="text-base font-medium text-neutral-900">
                  {languages.find(lang => lang.code === selectedLanguage)?.code}
                </span>
                <ChevronDown className={`w-4 h-4 text-neutral-900 transition-transform duration-200 ${isLanguageOpen ? 'rotate-180' : ''}`} />
                <div className="h-6">
                </div>
              </div>

              {isLanguageOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[160px] z-50">
                  {languages.map((language) => (
                    <div
                      key={language.code}
                      className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${selectedLanguage === language.code ? 'bg-gray-100' : ''
                        }`}
                      onClick={() => handleLanguageChange(language.code)}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span className="text-sm font-medium text-neutral-900">{language.name}</span>
                      {selectedLanguage === language.code && (
                        <div className="ml-auto w-2 h-2 bg-brand-green rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Menú móvil desplegable */}
      {isMobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col h-full">
              {/* Header del menú */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="h-6 flex items-center">
                  <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2"
                >
                  <X className="h-6 w-6 text-neutral-900" />
                </button>
              </div>

              {/* Navegación */}
              <nav className="flex-1 p-6">
                <div className="space-y-4">
                  {navigationItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="block text-lg font-medium text-neutral-900 py-3 border-b border-gray-100 hover:text-brand-green transition-colors"
                      onClick={(e) => {
                        const isAnchor = item.href.includes('#');
                        const isSamePage = pathname === '/' || pathname === '';
                        if (isAnchor && isSamePage) {
                          e.preventDefault();
                          const hash = item.href.substring(item.href.indexOf('#'));
                          handleSmoothScroll(hash);
                        }
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {item.name}
                    </Link>
                  ))}

                  {/* Link directo al perfil en móvil si está autenticado */}
                  {isAuthenticated && (
                    <Link
                      href="/perfil"
                      className="block text-lg font-medium text-neutral-900 py-3 border-b border-gray-100 hover:text-brand-green transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                  )}
                </div>
              </nav>

              {/* Footer del menú con controles */}
              <div className="p-6 border-t border-gray-200 space-y-4">
                {/* Teléfono */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Teléfono:</span>
                  <span className="text-sm font-semibold text-neutral-900">+351 928399390</span>
                </div>

                {/* Controles */}
                <div className="flex items-center justify-between">
                  {/* WhatsApp */}
                  <div className="text-highlight-wa hover:scale-110 transition-all duration-300 cursor-pointer">
                    <a
                      href="https://wa.me/351928399390"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src="/WA_Logo.svg" alt="whatsapp" className="w-6 h-6" style={{ transform: 'none' }} />
                    </a>
                  </div>

                  {/* Perfil del usuario */}
                  {isAuthenticated ? (
                    <div className="text-highlight-wa bg-brand-white border-1 rounded-full cursor-pointer gap-1 p-2">
                      <ProfileDropdown position="top" />
                    </div>
                  ) : (
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="text-highlight-wa bg-brand-white border-1 rounded-full hover:scale-110 transition-all duration-300 cursor-pointer gap-1 p-2">
                        <User className="h-6 w-6 text-neutral-900" />
                      </div>
                    </Link>
                  )}

                  {/* Selector de idioma móvil */}
                  <div className="relative">
                    <div
                      className="text-highlight-wa bg-brand-white border-1 rounded-full hover:scale-110 transition-all duration-300 cursor-pointer flex items-center gap-2 px-3 py-2"
                      onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                    >
                      <span className="text-sm font-medium text-neutral-900">
                        {languages.find(lang => lang.code === selectedLanguage)?.code}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-neutral-900 transition-transform duration-200 ${isLanguageOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isLanguageOpen && (
                      <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[160px] z-50">
                        {languages.map((language) => (
                          <div
                            key={language.code}
                            className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${selectedLanguage === language.code ? 'bg-gray-100' : ''
                              }`}
                            onClick={() => handleLanguageChange(language.code)}
                          >
                            <span className="text-lg">{language.flag}</span>
                            <span className="text-sm font-medium text-neutral-900">{language.name}</span>
                            {selectedLanguage === language.code && (
                              <div className="ml-auto w-2 h-2 bg-brand-green rounded-full"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

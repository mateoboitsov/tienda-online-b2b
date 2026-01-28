"use client";

import { Separator } from "@/components/ui/separator";
import { useViewportAnimation } from "@/lib/utils/animations";
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  // Hooks para animaciones basadas en viewport
  const { elementRef: logoRef, animationStyle: logoAnimation } = useViewportAnimation<HTMLDivElement>('fadeInLeft', 0.2);
  const { elementRef: descriptionRef, animationStyle: descriptionAnimation } = useViewportAnimation<HTMLParagraphElement>('fadeInLeft', 0.4);
  const { elementRef: linksRef, animationStyle: linksAnimation } = useViewportAnimation<HTMLDivElement>('fadeInUp', 0.6);
  const { elementRef: contactRef, animationStyle: contactAnimation } = useViewportAnimation<HTMLDivElement>('fadeInUp', 0.8);
  const { elementRef: socialRef, animationStyle: socialAnimation } = useViewportAnimation<HTMLDivElement>('fadeInUp', 1.0);

  return (
    <footer className="bg-brand-black text-brand-white relative overflow-hidden">
      {/* Elemento decorativo de fondo */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-green via-brand-neon to-brand-green opacity-20"></div>
      
      <div className="mx-auto px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Columna 1: Logo y descripción */}
          <div className="lg:col-span-2 space-y-6">
            <div 
              ref={logoRef}
              className="flex items-center space-x-4"
              style={logoAnimation}
            >
              <div className="h-12 flex items-center justify-center">
                <img src="/logo-white.svg" alt="Logo" className="w-full h-full object-contain" />
              </div>              
            </div>
            <div className="opacity-60">
              <p 
                ref={descriptionRef}
                className="text-brand-white/70 text-base leading-relaxed max-w-md"
                style={descriptionAnimation}
              >
                Tu proveedor confiable de dispositivos reacondicionados de alta calidad. 
                Piezas originales, entrega rápida y servicio técnico excepcional para empresas.
              </p>
            </div>            
          </div>
          
          {/* Columna 2: Enlaces rápidos */}
          <div 
            ref={linksRef}
            className="space-y-6"
            style={linksAnimation}
          >
            <h4 className="text-lg font-semibold font-poppins text-brand-white opacity-50">
              Productos
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-brand-white/70 hover:text-brand-green transition-colors duration-200 text-sm font-medium group">
                  <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                    Smartphones
                  </span>
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-white/70 hover:text-brand-green transition-colors duration-200 text-sm font-medium group">
                  <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                    Portátiles
                  </span>
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-white/70 hover:text-brand-green transition-colors duration-200 text-sm font-medium group">
                  <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                    Tablets
                  </span>
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-white/70 hover:text-brand-green transition-colors duration-200 text-sm font-medium group">
                  <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                    Relojes
                  </span>
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-white/70 hover:text-brand-green transition-colors duration-200 text-sm font-medium group">
                  <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                    Accesorios
                  </span>
                </a>
              </li>
            </ul>
          </div>
          
          {/* Columna 3: Información de contacto */}
          <div 
            ref={contactRef}
            className="space-y-6"
            style={contactAnimation}
          >
            <h4 className="text-lg font-semibold font-poppins text-brand-white opacity-50">
              Contacto
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" />
                <span className="text-brand-white/70 text-sm leading-relaxed">
                  Travessa do Conde da Ponte, n.10 - 1º Dto,
                  1300 - 141, Lisboa, Portugal
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-brand-green flex-shrink-0" />
                <span className="text-brand-white/70 text-sm">
                  Lun-Vie: 9:00 - 18:00
                </span>
              </li>              
              <li className="flex items-center space-x-3 text-brand-white/80">
                <Phone className="w-5 h-5 text-brand-green" />
                <span className="text-sm font-medium">+351 928399390</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-brand-green flex-shrink-0" />
                <span className="text-brand-white/70 text-sm">
                  info@versaltech.com
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Separador */}
        <Separator className="my-12 bg-brand-white/10" />
        
        {/* Sección inferior */}
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
          {/* Copyright y enlaces legales */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 opacity-50">
            <p className="text-brand-white/60 text-sm font-medium">
              © 2025 VersalTech. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-brand-white/60 hover:text-brand-green transition-colors duration-200 text-sm font-medium">
                Términos y Condiciones
              </a>
              <a href="#" className="text-brand-white/60 hover:text-brand-green transition-colors duration-200 text-sm font-medium">
                Política de Privacidad
              </a>
              <a href="#" className="text-brand-white/60 hover:text-brand-green transition-colors duration-200 text-sm font-medium">
                Cookies
              </a>
            </div>
          </div>
          
          
        </div>
      </div>
    </footer>
  );
}

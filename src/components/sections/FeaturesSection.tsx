"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useViewportAnimation, useViewportStaggeredAnimation } from "@/lib/utils/animations";

const features = [
  {
    image: "/piezas originales.png",
    title: "Piezas Originales",
    description: "Usados con piezas originales. Nada de compatibles.",
    badge: "Calidad",
    color: "bg-green-100 text-green-800"
  },
  {
    image: "/iphones.png",
    title: "iPhones Reacondicionados",
    description: "iPhones de alta calidad reacondicionados con garantía completa y precios competitivos.",
    badge: "Fiscal",
    color: "bg-indigo-100 text-indigo-800"
  },
  {
    image: "/Entrega 24:48.png",
    title: "Entrega Exprés",
    description: "Envíos a España y Portugal en 24 horas. Envíos a EU, CH & UK en 24/72h.",
    badge: "Velocidad",
    color: "bg-blue-100 text-blue-800"
  },
  {
    image: "/Servicio RMA sin largas.png",
    title: "Servicio RMA Premium",
    description: "Nuestro servicio premium de RMA actúa de forma rápida y sin largas para que ofrezcas la mejor garantía.",
    badge: "Soporte",
    color: "bg-purple-100 text-purple-800"
  },
  {
    image: "/atencion-personalizada.png",
    title: "Atención Personalizada",
    description: "Hablamos tu idioma: Español, Alemán, Inglés y Portugués.",
    badge: "Experiencia",
    color: "bg-orange-100 text-orange-800"
  }
];

export function FeaturesSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Hook para animación del título
  const { elementRef: titleRef, animationStyle: titleAnimation } = useViewportAnimation<HTMLHeadingElement>('fadeInUp', 0.2);
  // Hook para animación escalonada de las tarjetas
  const { containerRef: featuresRef, getItemAnimationStyle: getFeatureAnimation } = useViewportStaggeredAnimation('fadeInScale', 5, 0.1);

  // Función para scroll con flechas
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Adaptar el cálculo del ancho para móvil vs desktop
      const isMobile = window.innerWidth < 640; // sm breakpoint
      const cardWidth = isMobile
        ? (window.innerWidth - 80) + 16 // Ancho tarjeta móvil + gap de 16px
        : (window.innerWidth - 80 - 32) / 3 + 16; // Ancho desktop + gap
      const scrollAmount = cardWidth;

      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Función para actualizar visibilidad de flechas
  const updateArrows = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Efecto para actualizar flechas al montar y al cambiar el tamaño
  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="w-full mx-auto">
        <div className="text-left mb-4 pl-6 sm:pl-10">
          <h2
            ref={titleRef}
            className="text-foreground mb-4 max-w-[350px] sm:max-w-[450px] leading-tight sm:leading-[1]"
            style={titleAnimation}
          >
            Nuestro objetivo es ser tu respaldo fiable
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-[320px] sm:max-w-[600px] leading-relaxed">
            Construimos relaciones duraderas basadas en la confianza, la calidad y el servicio excepcional
          </p>
        </div>

        {/* Contenedor con scroll horizontal */}
        <div ref={featuresRef} className="relative group">
          {/* Flecha izquierda */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>
          )}

          {/* Flecha derecha */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>
          )}

          {/* Contenedor de scroll simple */}
          <div
            ref={scrollContainerRef}
            onScroll={updateArrows}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                data-index={index}
                className={`w-[calc(100vw-80px)] sm:w-[calc((100vw-80px-42px)/3)] h-[300px] sm:h-[350px] p-4 sm:p-6 bg-muted rounded-3xl flex flex-col justify-between items-start flex-shrink-0 ${index === 0 ? 'ml-6 sm:ml-10' : ''
                  } ${index === features.length - 1 ? 'mr-6 sm:mr-10' : ''
                  }`}
                style={getFeatureAnimation(index)}
              >
                <div className="w-32 h-32 sm:w-42 sm:h-42 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col justify-start items-start gap-1">
                  <h3 className={`text-foreground text-[18px] sm:text-[24px] leading-tight ${feature.title.includes('iPhones') ? 'normal-case' : 'capitalize'}`}>
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base font-medium text-muted-foreground max-w-[280px] sm:max-w-[310px] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

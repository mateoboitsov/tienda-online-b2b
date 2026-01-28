"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useViewportAnimation, useViewportStaggeredAnimation } from "@/lib/utils/animations";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const teamMembers = [
  {
    name: "María González",
    position: "CEO & Fundadora",
    description: "Con más de 15 años de experiencia en el sector tecnológico, María lidera nuestra visión estratégica y el crecimiento internacional.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    badge: "Liderazgo",
    color: "bg-blue-100 text-blue-800"
  },
  {
    name: "Carlos Silva",
    position: "Director de Operaciones",
    description: "Especialista en logística y cadena de suministro, Carlos garantiza que nuestros procesos sean eficientes y escalables.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    badge: "Operaciones",
    color: "bg-green-100 text-green-800"
  },
  {
    name: "Ana Rodríguez",
    position: "Directora Comercial",
    description: "Ana construye y mantiene las relaciones con nuestros clientes, asegurando un servicio personalizado y de calidad.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    badge: "Comercial",
    color: "bg-purple-100 text-purple-800"
  },
  {
    name: "João Santos",
    position: "Director Técnico",
    description: "Experto en tecnología y calidad, João supervisa todos nuestros procesos técnicos y de garantía de productos.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    badge: "Técnico",
    color: "bg-orange-100 text-orange-800"
  },
  {
    name: "Lisa Müller",
    position: "Directora de Soporte",
    description: "Lisa lidera nuestro equipo de atención al cliente multilingüe, asegurando la excelencia en el servicio.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    badge: "Soporte",
    color: "bg-indigo-100 text-indigo-800"
  }
];

export function AboutTeam() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Hook para animación del título
  const { elementRef: titleRef, animationStyle: titleAnimation } = useViewportAnimation<HTMLHeadingElement>('fadeInUp', 0.2);
  // Hook para animación escalonada de las tarjetas
  const { containerRef: teamRef, getItemAnimationStyle: getTeamAnimation } = useViewportStaggeredAnimation('fadeInScale', 5, 0.1);

  // Función para scroll con flechas
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = (window.innerWidth - 80 - 32) / 3 + 16; // Ancho calculado + gap
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
    <section className="py-20 bg-white hidden">
      <div className="w-full mx-auto">
        <div className="text-left mb-4 pl-10">
          <h2
            ref={titleRef}
            className="text-foreground mb-4 max-w-[450px]"
            style={titleAnimation}
          >
            Nuestro equipo
          </h2>
          <p className="text-base text-muted-foreground mb-8 max-w-[600px]">
            Un equipo multicultural y multilingüe comprometido con la excelencia y la satisfacción del cliente
          </p>
        </div>

        {/* Contenedor con scroll horizontal */}
        <div ref={teamRef} className="relative group">
          {/* Flecha izquierda */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
          )}

          {/* Flecha derecha */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          )}

          {/* Contenedor de scroll simple */}
          <div
            ref={scrollContainerRef}
            onScroll={updateArrows}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {teamMembers.map((member, index) => (
              <div
                key={index}
                data-index={index}
                className={`w-[calc((100vw-80px-42px)/3)] h-[350px] p-6 rounded-3xl flex flex-col justify-end items-start flex-shrink-0 relative overflow-hidden ${index === 0 ? 'ml-10' : ''
                  } ${index === teamMembers.length - 1 ? 'mr-10' : ''
                  }`}
                style={getTeamAnimation(index)}
              >
                {/* Imagen como fondo de toda la tarjeta */}
                <Image
                  src={member.image}
                  alt={member.name}
                  width={300}
                  height={350}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlay para legibilidad */}
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Contenido del miembro */}
                <div className="relative z-10 flex flex-col justify-end items-start gap-3 w-full">
                  <h3 className="text-xl font-bold text-white">
                    {member.name}
                  </h3>
                  <p className="text-base font-medium text-white/90 leading-relaxed">
                    {member.description}
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

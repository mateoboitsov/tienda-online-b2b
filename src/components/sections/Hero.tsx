"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Shield, Clock, Globe } from "lucide-react";
import { useViewportAnimation, useViewportStaggeredAnimation } from "@/lib/utils/animations";

const categories = [
  {
    image: "/moviles.png",
    title: "Smartphones"
  },
  {
    image: "/portatiles.png",
    title: "Portátiles"
  },
  {
    image: "/tablets.png",
    title: "Tablets"
  },
  {
    image: "/watch.png",
    title: "Relojes"
  },
  {
    image: "/otros.png",
    title: "Otros dispositivos"
  }
];

export function Hero() {
  // Usar hooks de animación basados en viewport
  const { elementRef: titleRef, animationStyle: titleAnimation } = useViewportAnimation<HTMLHeadingElement>('fadeInUp', 0.3);
  const { elementRef: subtitleRef, animationStyle: subtitleAnimation } = useViewportAnimation<HTMLParagraphElement>('fadeInUp', 0.5);
  const { elementRef: brandsRef, animationStyle: brandsAnimation } = useViewportAnimation<HTMLDivElement>('fadeInUp', 0.7);
  const { elementRef: backgroundRef, animationStyle: backgroundAnimation } = useViewportAnimation<HTMLDivElement>('fadeInScale', 0.1);
  const { containerRef: categoriesRef, getItemAnimationStyle: getCategoryAnimation } = useViewportStaggeredAnimation('fadeInScale', 5, 0.1);

  return (
    <section className="bg-gradient-to-br from-brand-white via-brand-gray to-brand-white sm:h-screen sm:min-h-[830px] flex flex-col items-center justify-center relative pt-32 sm:pt-36 pb-12 sm:pb-20 overflow-hidden">
      {/* Texto de fondo VERSALTECH */}
      <div
        ref={backgroundRef}
        className="absolute top-[100px] left-0 right-0 flex justify-center pointer-events-none"
        style={backgroundAnimation}
      >
        <div className="bg-gradient-to-b from-[#161614] to-[#16161400] bg-clip-text text-transparent opacity-5 max-w-full overflow-hidden">
          <span
            className="font-bold leading-none block"
            style={{
              fontSize: 'clamp(8rem, 16.5vw, 100rem)',
              textAlign: 'center',
              letterSpacing: '-0.05em'
            }}
          >
            VERSALTECH
          </span>
        </div>
      </div>

      {/* Texto de la sección */}
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Badges */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 px-4 sm:px-0">
            <span className="bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-brand-gray shadow-sm flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              RMA Premium
            </span>
            <span className="bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-brand-gray shadow-sm flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              Entrega exprés 24h
            </span>
            <span className="bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-brand-gray shadow-sm flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap">
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Envío a toda Europa, Suiza y Reino Unido</span>
              <span className="sm:hidden">Envío Europa</span>
            </span>
          </div>

          <h1
            ref={titleRef}
            className="text-brand-black mb-4 sm:mb-6 leading-tight px-2 sm:px-0"
            style={titleAnimation}
          >
            <span className="block sm:inline">Tu proveedor mayorista de confianza de</span>{" "}
            <span className="block sm:inline">dispositivos</span>{" "}
            <div className="text-highlight inline-block" style={{ transform: 'translateY(-2px) rotate(-1deg)' }}>
              <div className="text-highlight-content">nuevos, usados y reacondicionados</div>
            </div>
          </h1>
          <p
            ref={subtitleRef}
            className="text-sm sm:text-base opacity-60 text-brand-black/70 mb-6 sm:mb-8 max-w-[400px] sm:max-w-[500px] mx-auto px-4 sm:px-0 leading-relaxed"
            style={subtitleAnimation}
          >
            Somos una empresa con sede en Portugal, especializada en la venta mayorista de dispositivos Apple, Samsung, Xiaomi y más.
          </p>
        </div>
      </div>

      {/* Slider infinito de marcas */}
      <div
        ref={brandsRef}
        className="w-full overflow-hidden bg-white/50 backdrop-blur-sm py-4 sm:py-8"
        style={brandsAnimation}
      >
        <div className="flex animate-scroll space-x-8 sm:space-x-16 whitespace-nowrap">
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Apple</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Samsung</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Xiaomi</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Oppo</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Google</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Poco</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Realme</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">ZTE</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Apple</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Samsung</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Xiaomi</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Oppo</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Google</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Poco</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Realme</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">ZTE</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Apple</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Samsung</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Xiaomi</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Oppo</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Google</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Poco</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Realme</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">ZTE</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Apple</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Samsung</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Xiaomi</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Oppo</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Google</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Poco</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">Realme</span>
          <span className="text-sm sm:text-base font-semibold text-brand-gray/60 opacity-60">ZTE</span>
        </div>
      </div>

      {/* Contenedor de categorías */}
      <div ref={categoriesRef} className="w-full px-6 sm:px-10 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 justify-start">
          {categories.map((category, index) => (
            <div
              key={index}
              data-index={index}
              className="w-full h-48 bg-muted px-4 md:px-8 pt-6 pb-9 rounded-3xl flex flex-col justify-between items-left transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-brand-gray/20 hover:-translate-y-1 cursor-pointer group"
              style={getCategoryAnimation(index)}
            >
              <div className="w-[74px] h-[74px] md:w-[96px] md:h-[96px] rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Image
                  src={category.image}
                  alt={category.title}
                  width={74}
                  height={74}
                  className="w-[74px] h-[74px] md:w-[96px] md:h-[96px] object-contain transition-transform duration-300 group-hover:rotate-3"
                />
              </div>
              <div className="font-semibold text-[16px] md:text-[24px] md:leading-[1.4] md:font-medium text-foreground text-left transition-colors duration-300 group-hover:text-highlight-content" style={{ letterSpacing: 'calc(1em / 100 * -5)' }}>{category.title}</div>
            </div>
          ))}
          {/* Espacio vacío para la sexta posición en móvil */}
          <div className="block md:hidden"></div>
        </div>
      </div>
    </section>
  );
}


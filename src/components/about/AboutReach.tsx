"use client";

import { useViewportAnimation, useViewportStaggeredAnimation } from "@/lib/utils/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AboutReach() {
  // Hook para animación del título
  const { elementRef: titleRef, animationStyle: titleAnimation } = useViewportAnimation<HTMLHeadingElement>('fadeInUp', 0.2);
  // Hook para animación escalonada de las tarjetas
  const { containerRef: reachRef, getItemAnimationStyle: getReachAnimation } = useViewportStaggeredAnimation('fadeInScale', 4, 0.1);

  const reachData = [
    {
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: "Tiendas Físicas",
      description: "Enviamos directamente a tu tienda física o incluso a tus clientes finales, sin que tengas una página web.",
      color: "bg-green-100 text-green-800",
      badge: "Comercio"
    },
    {
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      title: "Distribuidores",
      description: "Somos el partner ideal para distribuidores que buscan calidad y precios competitivos.",
      color: "bg-blue-100 text-blue-800",
      badge: "Distribución"
    },
    {
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      title: "Marketplaces",
      description: "Vendedores en plataformas online confían en nosotros para su inventario.",
      color: "bg-purple-100 text-purple-800",
      badge: "Online"
    },
    {
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "E-commerce",
      description: "Tiendas online encuentran en nosotros un proveedor estable y confiable.",
      color: "bg-orange-100 text-orange-800",
      badge: "Digital"
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="w-full mx-auto">
        {/* Contenedor principal con diseño inspirado en HowWeWorkSection */}
        <div 
          className="mx-6 sm:mx-10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col md:flex-row justify-start items-start bg-gradient-to-br from-brand-gray/20 to-highlight/10 border border-brand-gray/200 gap-6 md:gap-0"
        >
          {/* Columna con título y descripción */}
          <div className="w-full md:w-[calc((100vw-80px-84px)/3)] h-full flex flex-col justify-start items-start p-0 md:p-6">
            <h1 
              ref={titleRef}
              className="text-[28px] sm:text-3xl font-bold text-foreground leading-tight mb-4"
              style={titleAnimation}
            >
              Trabajamos con todo tipo de empresas
            </h1>
            {/* Información adicional con estilo similar a FeaturesSection */}
            <div className="text-left sm:text-center mb-4">
              <div className="text-highlight" style={{padding: '8px 12px', borderRadius: '10px'}}>
                <span className="text-highlight-content" style={{fontSize: '18px', lineHeight: '1.05', letterSpacing: '-1px'}}>
                  <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Atención personalizada
                </span>
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Adaptamos nuestros servicios a las necesidades específicas de cada tipo de empresa, desde tiendas físicas hasta plataformas digitales
            </p>
          </div>
          
          {/* Grid de 2x2 para los tipos de cliente */}
          <div 
            ref={reachRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full md:w-auto"
          >          
            {reachData.map((item, index) => (
              <div 
                key={index} 
                data-index={index}
                className="w-full md:w-[calc((100vw-80px-84px)/3)] h-[280px] sm:h-[350px] p-4 sm:p-6 bg-muted rounded-2xl sm:rounded-3xl flex flex-col justify-between items-start transition-all duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 cursor-pointer group"
                style={getReachAnimation(index)}
              >
                {/* Badge superior */}
                <div className="w-full flex justify-between">
                  {/* Icono del tipo de cliente */}
                  <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl flex items-start justify-start overflow-hidden bg-gradient-to-br from-brand-gray/10 to-highlight/5 opacity-30">
                    {item.icon}
                  </div>
                  <Badge className={`${item.color} border-0 text-xs h-6 sm:h-8 rounded-full font-medium px-2 sm:px-3`}>
                    {item.badge}
                  </Badge>
                  
                </div>
                
                
                
                {/* Contenido del tipo de cliente */}
                <div className="flex flex-col justify-start items-start gap-1 sm:gap-2">
                  <h3 className="text-[18px] sm:text-xl font-bold text-foreground capitalize transition-colors duration-300 group-hover:text-highlight-content leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base font-medium text-muted-foreground max-w-[280px] sm:max-w-[310px] leading-relaxed">
                    {item.description}
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

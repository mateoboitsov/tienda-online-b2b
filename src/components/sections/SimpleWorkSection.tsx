"use client";

import { useViewportAnimation } from "@/lib/utils/animations";

export function SimpleWorkSection() {
  // Hook para animación del título
  const { elementRef: titleRef, animationStyle: titleAnimation } = useViewportAnimation<HTMLHeadingElement>('fadeInUp', 0.2);

  return (
    <section id="como-trabajamos" className="py-24 bg-white">
      <div className="w-full mx-auto">
        {/* Contenedor principal con imagen de fondo */}
        <div 
          className="mx-10 rounded-3xl p-8 flex justify-start items-start bg-cover bg-center bg-no-repeat bg-black"
          style={{ backgroundImage: 'url("/Mapa de Europa (1).svg")' }}
        >
          {/* Columna con título */}
          <div className="w-[calc((100vw-80px-84px)/3)] h-[580px] flex flex-col justify-center items-start p-6">
            <h1 
              ref={titleRef}
              className="text-3xl font-bold text-white leading-tight"
              style={titleAnimation}
            >
              Llegamos a donde necesites
            </h1>
            {/* Información adicional con estilo similar a FeaturesSection */}
            <div className="text-center mt-4">
              <div className="text-highlight" style={{padding: '10px 10px', borderRadius: '10px'}}>
                <span className="text-highlight-content" style={{fontSize: '24px', lineHeight: '1.05', letterSpacing: '-1px'}}>
                  <svg className="inline-block w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Envíos en 24-72 horas
                </span>
              </div>
            </div>
          </div>
          
          {/* Columna vacía para espacio de diseño */}
          <div className="w-[calc((100vw-80px-84px)/3)] h-[350px]"></div>
        </div>      
      </div>
    </section>
  );
}

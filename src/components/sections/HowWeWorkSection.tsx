"use client";

import { useViewportAnimation, useViewportStaggeredAnimation } from "@/lib/utils/animations";

const processSteps = [
  {
    number: "01",
    title: "Solicita dispositivos que necesites ",
    description: "Indícanos qué equipos necesitas, así podremos ajustarnos exactamente a lo que buscas."
  },
  {
    number: "02",
    title: "Obtén propuesta a medida",
    description: "Te enviamos una propuesta personalizada con modelos y precios claros, sin sorpresas."
  },
  {
    number: "03",
    title: "En 24/72h recibes la entrega",
    description: "Aceptas la propuesta y en 24/72 h tienes los dispositivos en tus manos."
  },
  {
    number: "04",
    title: "Soporte RMA sin esperas",
    description: "Servicio técnico (RMA) rápido y eficaz, sin trámites eternos ni complicaciones."
  }
];

export function HowWeWorkSection() {
  // Hook para animación del título
  const { elementRef: titleRef, animationStyle: titleAnimation } = useViewportAnimation<HTMLHeadingElement>('fadeInUp', 0.2);
  // Hook para animación escalonada de las tarjetas
  const { containerRef: stepsRef, getItemAnimationStyle: getStepAnimation } = useViewportStaggeredAnimation('fadeInScale', 4, 0.1);

  return (
    <section id="como-trabajamos" className="py-16 sm:py-24 bg-white">
      <div className="w-full mx-auto">
        <div className="text-left mb-4 pl-6 sm:pl-10">          
          <h2 
            ref={titleRef}
            className="text-foreground mb-4 leading-tight sm:leading-[1]"
            style={titleAnimation}
          >
            CÓMO TRABAJAMOS
          </h2>
        </div>
        
        {/* Contenedor principal con imagen de fondo */}
        <div 
          className="mx-6 sm:mx-10 rounded-3xl p-4 sm:p-8 flex justify-start items-start bg-cover bg-center bg-no-repeat bg-black"
          style={{ backgroundImage: 'url("/fondo como trabajamos.jpg")' }}
        >
          {/* Columna vacía para espacio de diseño - Solo en desktop */}
          <div className="hidden md:block w-[calc((100vw-80px-84px)/3)] h-[350px]"></div>
          <div 
            ref={stepsRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full md:w-auto"
          >          
            
            {processSteps.map((step, index) => (
              <div 
                key={index} 
                data-index={index}
                className="w-full md:w-[calc((100vw-80px-84px)/3)] h-[280px] sm:h-[350px] p-4 sm:p-6 bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl flex flex-col justify-between items-start"
                style={getStepAnimation(index)}
              >
                {/* Número del paso (en lugar de imagen) */}
                <div className="w-32 h-32 sm:w-42 sm:h-42 rounded-2xl flex items-start justify-start overflow-hidden">
                  <div className="text-[48px] sm:text-[64px] font-medium text-white/10 leading-none" style={{ letterSpacing: '-2.56px' }}>
                    {step.number}
                  </div>
                </div>
                
                {/* Contenido del paso */}
                <div className="flex flex-col justify-start items-start gap-1">
                  <h3 className="capitalize text-white text-[18px] sm:text-[24px] leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base font-medium text-white/90 max-w-[280px] sm:max-w-[310px] opacity-60 leading-relaxed">
                    {step.description}
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

"use client";

import { useViewportAnimation, useViewportStaggeredAnimation } from "@/lib/utils/animations";
import { Badge } from "@/components/ui/badge";

export function AboutHistoryValues() {
  const { elementRef: titleRef, animationStyle: titleAnimation } = useViewportAnimation<HTMLHeadingElement>('fadeInUp', 0.2);
  const { elementRef: historyRef, animationStyle: historyAnimation } = useViewportAnimation<HTMLDivElement>('fadeInUp', 0.4);
  const { containerRef: valuesRef, getItemAnimationStyle: getValueAnimation } = useViewportStaggeredAnimation('fadeInScale', 3, 0.1);

  const values = [
    {
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Calidad",
      description: "Garantizamos productos originales y de primera calidad, sin comprometer la excelencia.",
      color: "bg-green-100 text-green-800",
      badge: "Compromiso"
    },
    {
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Rapidez",
      description: "Entregamos en tiempo récord para que tu negocio nunca se detenga.",
      color: "bg-blue-100 text-blue-800",
      badge: "Eficiencia"
    },
    {
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Confianza",
      description: "Construimos relaciones duraderas basadas en la transparencia y el respeto mutuo.",
      color: "bg-purple-100 text-purple-800",
      badge: "Relación"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="w-full mx-auto">
        {/* Contenedor principal con diseño inspirado en Hero.tsx */}
        <div 
          className="mx-10 rounded-3xl p-8 flex flex-col justify-start items-start bg-gradient-to-br from-brand-gray/20 to-highlight/10 border border-brand-gray/200"
        >
          {/* Título */}
          <h1 
            ref={titleRef}
            className="text-3xl font-bold text-foreground leading-tight mb-8"
            style={titleAnimation}
          >
            Nuestra historia y nuestros valores
          </h1>
          
          {/* Historia */}
          <div 
            ref={historyRef}
            className="w-full mb-12"
            style={historyAnimation}
          >
            <p className="text-base text-muted-foreground leading-relaxed max-w-4xl">
              Fundada con la visión de revolucionar el mercado mayorista de dispositivos tecnológicos, 
              nuestra empresa nació del deseo de ofrecer una alternativa confiable y eficiente. 
              Desde nuestros inicios, hemos crecido exponencialmente, estableciendo relaciones sólidas 
              con distribuidores, tiendas físicas y plataformas online en toda Europa. 
              Nuestro compromiso con la excelencia nos ha llevado a ser reconocidos como un partner 
              estratégico en el sector tecnológico.
            </p>
          </div>
          
          {/* Grid de valores */}
          <div 
            ref={valuesRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
          >          
            {values.map((value, index) => (
              <div 
                key={index} 
                data-index={index}
                className="w-full h-[280px] p-6 bg-muted rounded-3xl flex flex-col justify-between items-start transition-all duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 cursor-pointer group"
                style={getValueAnimation(index)}
              >
                {/* Badge superior */}
                <div className="w-full flex justify-between">
                  {/* Icono del valor */}
                  <div className="w-18 h-18 rounded-2xl flex items-start justify-start overflow-hidden bg-gradient-to-br from-brand-gray/10 to-highlight/5 opacity-30">
                    {value.icon}
                  </div>
                  <Badge className={`${value.color} border-0 text-xs h-8 rounded-full font-medium`}>
                    {value.badge}
                  </Badge>
                </div>
                
                {/* Contenido del valor */}
                <div className="flex flex-col justify-start items-start gap-2">
                  <h3 className="text-xl font-bold text-foreground capitalize transition-colors duration-300 group-hover:text-highlight-content">
                    {value.title}
                  </h3>
                  <p className="text-base font-medium text-muted-foreground leading-relaxed">
                    {value.description}
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

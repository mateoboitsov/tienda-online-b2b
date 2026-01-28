"use client";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";
import { useViewportAnimation, useViewportStaggeredAnimation } from "@/lib/utils/animations";

const testimonials = [
  {
    name: "María González",
    company: "TechCorp Solutions",
    role: "Directora de IT",
    content: "TechStore ha sido fundamental para modernizar nuestra infraestructura tecnológica. Sus productos son de excelente calidad y el soporte técnico es excepcional.",
    rating: 5,
    category: "Empresa Tecnológica"
  },
  {
    name: "Carlos Rodríguez",
    company: "InnovateLab",
    role: "CEO",
    content: "Como startup, necesitábamos equipos confiables sin comprometer nuestro presupuesto. TechStore nos ofreció las mejores opciones con precios competitivos.",
    rating: 5,
    category: "Startup"
  },
  {
    name: "Ana Martínez",
    company: "Digital Marketing Pro",
    role: "Gerente de Operaciones",
    content: "La asesoría personalizada que recibimos fue invaluable. Nos ayudaron a elegir exactamente lo que necesitábamos para optimizar nuestro flujo de trabajo.",
    rating: 5,
    category: "Agencia Digital"
  },
  {
    name: "Luis Fernández",
    company: "EduTech Institute",
    role: "Director Académico",
    content: "Equipamos 3 laboratorios completos con TechStore. La calidad de los equipos y el servicio post-venta superaron nuestras expectativas.",
    rating: 5,
    category: "Educación"
  },
  {
    name: "Sofia Herrera",
    company: "Creative Studios",
    role: "Directora Creativa",
    content: "Los productos de audio y video que compramos han elevado la calidad de nuestro trabajo creativo. Definitivamente volveremos a comprar aquí.",
    rating: 5,
    category: "Estudio Creativo"
  },
  {
    name: "Roberto Silva",
    company: "Cloud Solutions",
    role: "Arquitecto de Sistemas",
    content: "La confiabilidad de los equipos de red que adquirimos es impresionante. Hemos tenido 0% de fallas en 2 años de operación continua.",
    rating: 5,
    category: "Consultoría IT"
  }
];

export function TestimonialsSection() {
  // Hooks para animaciones basadas en viewport
  const { elementRef: badgeRef, animationStyle: badgeAnimation } = useViewportAnimation<HTMLDivElement>('fadeInUp', 0.2);
  const { elementRef: titleRef, animationStyle: titleAnimation } = useViewportAnimation<HTMLHeadingElement>('fadeInUp', 0.4);
  const { elementRef: subtitleRef, animationStyle: subtitleAnimation } = useViewportAnimation<HTMLParagraphElement>('fadeInUp', 0.6);
  const { containerRef: testimonialsRef, getItemAnimationStyle: getTestimonialAnimation } = useViewportStaggeredAnimation('fadeInScale', 3, 0.1);

  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/30">
      <div className="mx-auto px-10">
        <div className="text-center mb-16">
          <Badge 
            ref={badgeRef}
            variant="secondary" 
            className="mb-4 px-4 py-1 text-xl font-semibold tracking-[-0.64px] text-brand-neon bg-brand-green uppercase"
            style={badgeAnimation}
          >
            Testimonios
          </Badge>
          <h2 
            ref={titleRef}
            className="text-foreground mb-4"
            style={titleAnimation}
          >
            Lo que dicen nuestros clientes
          </h2>
          <div className="opacity-60">
            <p 
              ref={subtitleRef}
              className="text-base opacity-50 max-w-[560px] mx-auto"
              style={subtitleAnimation}
            >
              Descubre por qué cientos de empresas confían en nosotros como su proveedor mayorista de confianza de dispositivos reacondicionados
            </p>
          </div>
        </div>
        
        <div ref={testimonialsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} data-index={index} style={getTestimonialAnimation(index)}>
              <Card className="group transition-all duration-300 border-0 bg-muted hover:scale-105 hover:-translate-y-1 hover:shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-highlight rounded-full flex items-center justify-center text-highlight">
                      <span className="text-brand-neon font-bold text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <Quote className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {testimonial.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="text-base text-muted-foreground leading-relaxed italic">
                  "{testimonial.content}"
                </CardDescription>
                
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-sm font-medium text-black">
                    {testimonial.company}
                  </p>
                </div>
              </CardContent>
            </Card>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm">4.9/5 calificación promedio</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm">+1000 empresas satisfechas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm">99% de clientes recomiendan</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

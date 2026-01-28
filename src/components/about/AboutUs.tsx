"use client";

import { useViewportAnimation } from "@/lib/utils/animations";

export function AboutUs() {
  const { elementRef: titleRef, animationStyle: titleAnimation } = useViewportAnimation<HTMLHeadingElement>('fadeInUp', 0.3);
  const { elementRef: descriptionRef, animationStyle: descriptionAnimation } = useViewportAnimation<HTMLParagraphElement>('fadeInUp', 0.5);

  return (
    <section className="bg-white min-h-[550px] h-[80vh] flex items-center justify-center pt-20">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 
            ref={titleRef}
            className="text-brand-black"
            style={titleAnimation}
          >
            Más que un proveedor,{" "}
            <div className="text-highlight" style={{ transform: 'translateY(-2px) rotate(-1deg)' }}>
              <div className="text-highlight-content">somos tu partner tecnológico</div>
            </div>
          </h1>
          <p 
            ref={descriptionRef}
            className="text-base opacity-60 text-brand-black/70 max-w-[500px] mx-auto"
            style={descriptionAnimation}
          >
            Somos una empresa especializada en la venta mayorista de dispositivos tecnológicos, con sede en Portugal. 
            Nuestra misión es proporcionar a nuestros clientes productos de alta calidad a precios competitivos, 
            respaldados por un servicio excepcional y una atención personalizada en múltiples idiomas.
          </p>              
        </div>        
      </div>
    </section>
  );
}

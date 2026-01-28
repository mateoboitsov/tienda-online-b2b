"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQSection() {
  const faqs = [
    {
      question: "¿Desde dónde enviáis?",
      answer: "Realizamos envíos a toda España peninsular desde nuestro almacén central. Para Baleares, Canarias y otros territorios, consulta con nuestro equipo comercial para conocer las condiciones específicas de envío."
    },
    {
      question: "¿Qué garantía ofrecéis?",
      answer: "Ofrecemos garantía de 2 años en todos nuestros productos, cubriendo defectos de fabricación y funcionamiento. Además, disponemos de un servicio técnico especializado para resolver cualquier incidencia durante el período de garantía."
    },
    {
      question: "¿Qué calidad tienen los móviles?",
      answer: "Trabajamos exclusivamente con dispositivos de primera calidad. Todos nuestros móviles son originales de fábrica, con baterías en perfecto estado y sin daños estéticos. Realizamos pruebas exhaustivas antes de cada envío para garantizar su perfecto funcionamiento."
    },
    {
      question: "¿Hay pedido mínimo?",
      answer: "Sí, establecemos un pedido mínimo de 500€ para envíos estándar. Sin embargo, para clientes B2B frecuentes, podemos flexibilizar esta cantidad. Contacta con nuestro equipo comercial para más detalles."
    },
    {
      question: "¿Cómo se hace un pedido?",
      answer: "El proceso es muy sencillo: 1) Contacta con nuestro equipo comercial, 2) Recibe tu cotización personalizada, 3) Confirma el pedido, 4) Realiza el pago según las condiciones acordadas, 5) Recibe tu pedido en 24-48 horas."
    },
    {
      question: "¿Cuáles son los precios?",
      answer: "En nuestra Tienda B2B, los precios son fijos y no negociables, sin IVA (Marginal VAT). Incluyen envío gratuito, caja original, cable y protector de pantalla. Los precios se adaptan al volumen de compra con descuentos automáticos. Para acceder a la tienda, necesitas credenciales de empresa que te proporcionamos."
    },
    {
      question: "¿Trabajáis con particulares?",
      answer: "No, nos especializamos exclusivamente en ventas B2B (empresa a empresa). Nuestro modelo de negocio está diseñado para satisfacer las necesidades de empresas, distribuidores y comercios que requieren volúmenes significativos de productos. Para particulares, recomendamos buscar en tiendas especializadas en venta al público."
    },
    {
      question: "¿Cómo funciona la Tienda B2B?",
      answer: "La Tienda B2B es un acceso exclusivo para empresas con credenciales asignadas. Muestra stock en tiempo real, precios fijos sin IVA (Marginal VAT) con envío incluido, y permite configurar envíos directos a tu negocio o a tus clientes. Incluye caja original, cable y protector de pantalla en todos los productos."
    }
  ]

  return (
    <section id="preguntas-frecuentes" className="py-24 bg-brand-white">
      <div className="cmx-auto px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="lg:pr-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-base opacity-50">
              Resolvemos todas tus dudas sobre nuestros productos y servicios
            </p>
          </div>
          
          <div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-semibold text-gray-900">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-base opacity-50">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}

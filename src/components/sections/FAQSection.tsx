"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQSection() {
  const faqCategories = [
    {
      title: "Sobre Versaltech B2B",
      items: [
        {
          question: "¿Qué es Versaltech B2B?",
          answer: "Versaltech B2B es una plataforma especializada en la venta mayorista de telefonía móvil nueva, usada y reacondicionada, dirigida exclusivamente a profesionales, empresas y distribuidores."
        },
        {
          question: "¿Vendéis a particulares?",
          answer: "No. Versaltech B2B opera únicamente en el canal profesional (B2B). Para comprar es necesario ser empresa o autónomo."
        }
      ]
    },
    {
      title: "Productos",
      items: [
        {
          question: "¿Qué tipos de dispositivos ofrecéis?",
          answer: "Disponemos de smartphones nuevos y usados de las principales marcas del mercado."
        },
        {
          question: "¿Qué diferencia hay entre un producto usado y uno reacondicionado?",
          answer: (
            <div className="space-y-2">
              <p>Ofrecemos dos categorías claras para productos no nuevos:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Usado:</strong> dispositivo funcional, probado, con signos de uso visibles según grado estético.</li>
                <li><strong>Reacondicionado:</strong> dispositivo revisado técnicamente, testeado, limpiado y clasificado según estándares de calidad.</li>
              </ul>
            </div>
          )
        },
        {
          question: "¿Los dispositivos son originales?",
          answer: "Sí. Todos los productos comercializados son 100 % originales."
        },
        {
          question: "¿Los terminales son libres?",
          answer: "Sí, salvo que se indique expresamente lo contrario en la ficha del producto."
        },
        {
          question: "¿Qué grados estéticos manejáis?",
          answer: "Trabajamos con distintos grados (por ejemplo A+, A, B, C). Cada grado indica el estado estético del dispositivo y se detalla en la descripción del producto."
        }
      ]
    },
    {
      title: "Pedidos",
      items: [
        {
          question: "¿Existe un pedido mínimo?",
          answer: "Sí. El pedido mínimo puede variar según producto o categoría. Esta información se indica en la web o puede consultarse con el equipo comercial."
        },
        {
          question: "¿Cómo realizo un pedido?",
          answer: "Debes registrarte como cliente profesional, acceder a tu cuenta y realizar el pedido directamente desde la plataforma."
        },
        {
          question: "¿Puedo reservar stock?",
          answer: "La reserva de stock está sujeta a disponibilidad y condiciones comerciales. Contacta con tu gestor comercial para más información."
        }
      ]
    },
    {
      title: "Precios y facturación",
      items: [
        {
          question: "¿Los precios incluyen IVA?",
          answer: "No. Los precios se muestran sin IVA, salvo que se indique lo contrario."
        },
        {
          question: "¿Emitís factura?",
          answer: "Sí. Todas las operaciones incluyen factura conforme a la normativa fiscal vigente."
        },
        {
          question: "¿Trabajáis con IVA intracomunitario?",
          answer: "Sí, para empresas registradas en el ROI/VIES y con documentación válida."
        }
      ]
    },
    {
      title: "Pagos",
      items: [
        {
          question: "¿Qué métodos de pago aceptáis?",
          answer: "Aceptamos transferencia bancaria y otros métodos según acuerdo comercial."
        },
        {
          question: "¿Es posible comprar a crédito?",
          answer: "Las condiciones de crédito están sujetas a aprobación previa y volumen de compra."
        }
      ]
    },
    {
      title: "Envíos",
      items: [
        {
          question: "¿A qué países enviáis?",
          answer: "Realizamos envíos nacionales e internacionales. Los destinos disponibles pueden variar."
        },
        {
          question: "¿Cuánto tarda el envío?",
          answer: "El plazo de entrega habitual es de 24 a 72 horas laborables, dependiendo del destino y disponibilidad de stock."
        },
        {
          question: "¿Los dispositivos se envían asegurados?",
          answer: "Sí, todos los envíos se realizan con seguro y número de seguimiento."
        }
      ]
    },
    {
      title: "Garantía y devoluciones",
      items: [
        {
          question: "¿Los productos tienen garantía?",
          answer: "Sí. Los dispositivos reacondicionados y usados incluyen garantía, cuya duración se especifica en cada caso."
        },
        {
          question: "¿Qué cubre la garantía?",
          answer: "La garantía cubre defectos de funcionamiento no derivados de un mal uso, golpes, humedad o manipulaciones no autorizadas."
        },
        {
          question: "¿Aceptáis devoluciones?",
          answer: "Las devoluciones están sujetas a las condiciones generales de venta. Es necesario contactar previamente con el servicio de atención al cliente."
        }
      ]
    },
    {
      title: "Soporte y contacto",
      items: [
        {
          question: "¿Dispongo de un gestor comercial?",
          answer: "Sí, asignamos gestor comercial según volumen y tipo de cliente."
        },
        {
          question: "¿Cómo puedo contactar con Versaltech B2B?",
          answer: "Puedes contactar a través del formulario web, correo electrónico o directamente con tu gestor comercial."
        }
      ]
    }
  ];

  return (
    <section id="preguntas-frecuentes" className="py-24 bg-brand-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          <div className="lg:sticky lg:top-24">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Preguntas Frecuentes
            </h2>
            <p className="text-lg text-gray-500 mb-8">
              Resolvemos todas tus dudas sobre nuestros productos y servicios para profesionales.
            </p>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 italic text-sm text-gray-400">
              Versaltech B2B se reserva el derecho de modificar estas preguntas frecuentes sin previo aviso.
            </div>
          </div>

          <div className="lg:col-span-2 space-y-12">
            {faqCategories.map((category, catIndex) => (
              <div key={catIndex}>
                <h3 className="text-xl font-bold text-brand-primary mb-6 flex items-center gap-3">
                  <span className="w-8 h-1 bg-brand-primary rounded-full" />
                  {category.title}
                </h3>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <AccordionItem
                      key={itemIndex}
                      value={`item-${catIndex}-${itemIndex}`}
                      className="border border-gray-100 rounded-xl px-4 bg-white shadow-sm transition-all hover:shadow-md"
                    >
                      <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:no-underline py-4">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="leading-relaxed text-base text-gray-500 pb-4">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useViewportAnimation } from "@/lib/utils/animations";
import { ChevronsUpDown, Apple, Smartphone, Laptop, Tablet, Watch, Headphones } from "lucide-react";

// Estructura de familias de productos
const productFamilies = {
  "Apple": {
    icon: Apple,
    models: {
      "iPhone": {
        conditions: ["Nuevo", "Usado", "Reacondicionado Premium", "Apple Asis", "Apple Asis +", "CPO"]
      },
      "MacBook": {
        conditions: ["Nuevo", "Usado"]
      },
      "iMac": {
        conditions: ["Nuevo", "Usado"]
      },
      "Apple Watch": {
        conditions: ["Nuevo", "Usado"]
      },
      "iPad": {
        conditions: ["Nuevo", "Usado"]
      },
      "Accesorios": {
        conditions: ["Nuevo"]
      }
    }
  },
  "Samsung": {
    icon: Smartphone,
    category: "Smartphones"
  },
  "Xiaomi": {
    icon: Smartphone,
    category: "Smartphones"
  },
  "Oppo": {
    icon: Smartphone,
    category: "Smartphones"
  },
  "Google": {
    icon: Smartphone,
    category: "Smartphones"
  },
  "Poco": {
    icon: Smartphone,
    category: "Smartphones"
  },
  "Realme": {
    icon: Smartphone,
    category: "Smartphones"
  },
  "ZTE": {
    icon: Smartphone,
    category: "Smartphones"
  }
};

export function CTASection() {
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    selectedBrands: [] as string[],
    selectedModels: [] as string[],
    selectedConditions: [] as string[],
    message: ""
  });
  const [acceptCommunications, setAcceptCommunications] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);

  // Hooks para animaciones basadas en viewport
  const { elementRef: backgroundRef, animationStyle: backgroundAnimation } = useViewportAnimation<HTMLDivElement>('fadeInScale', 0);
  const { elementRef: titleRef, animationStyle: titleAnimation } = useViewportAnimation<HTMLHeadingElement>('fadeInUp', 0);
  const { elementRef: subtitleRef, animationStyle: subtitleAnimation } = useViewportAnimation<HTMLParagraphElement>('fadeInUp', 0);
  const { elementRef: formRef, animationStyle: formAnimation } = useViewportAnimation<HTMLFormElement>('fadeInUp', 0);

  const handleBrandToggle = (brand: string) => {
    setFormData(prev => {
      const newSelectedBrands = prev.selectedBrands.includes(brand)
        ? prev.selectedBrands.filter(b => b !== brand)
        : [...prev.selectedBrands, brand];

      let newSelectedModels = prev.selectedModels;
      let newSelectedConditions = prev.selectedConditions;

      // Si se deselecciona Apple, limpiar modelos (solo Apple los tiene)
      if (brand === "Apple" && !newSelectedBrands.includes("Apple")) {
        newSelectedModels = [];
      }

      // Solo limpiar condiciones si no hay ninguna marca seleccionada
      if (newSelectedBrands.length === 0) {
        newSelectedConditions = [];
      }

      return {
        ...prev,
        selectedBrands: newSelectedBrands,
        selectedModels: newSelectedModels,
        selectedConditions: newSelectedConditions
      };
    });
  };

  const handleModelToggle = (model: string) => {
    setFormData(prev => ({
      ...prev,
      selectedModels: prev.selectedModels.includes(model)
        ? prev.selectedModels.filter(m => m !== model)
        : [...prev.selectedModels, model]
    }));
  };

  const handleConditionToggle = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      selectedConditions: prev.selectedConditions.includes(condition)
        ? prev.selectedConditions.filter(c => c !== condition)
        : [...prev.selectedConditions, condition]
    }));
  };

  const handleSelectAllBrands = () => {
    setFormData(prev => ({
      ...prev,
      selectedBrands: Object.keys(productFamilies)
    }));
  };

  const handleClearAllBrands = () => {
    setFormData(prev => ({
      ...prev,
      selectedBrands: [],
      selectedModels: [],
      selectedConditions: []
    }));
  };

  const handleSelectAllModels = () => {
    const allOptions: string[] = [];

    // Si Apple está seleccionado, agregar todos los modelos de Apple
    if (formData.selectedBrands.includes("Apple")) {
      allOptions.push(...Object.keys(productFamilies.Apple.models));
    }

    // Si hay otras marcas seleccionadas, agregar todas las categorías
    if (formData.selectedBrands.some(brand => brand !== "Apple")) {
      allOptions.push("Smartphones", "Portátiles", "Tablets", "Otros dispositivos");
    }

    setFormData(prev => ({
      ...prev,
      selectedModels: allOptions
    }));
  };

  const handleClearAllModels = () => {
    setFormData(prev => ({
      ...prev,
      selectedModels: []
    }));
  };

  const handleSelectAllConditions = () => {
    if (formData.selectedBrands.includes("Apple")) {
      // Si Apple está seleccionado, seleccionar todos los estados de Apple
      const allConditions = new Set<string>();
      Object.values(productFamilies.Apple.models).forEach(model => {
        model.conditions.forEach(condition => allConditions.add(condition));
      });
      setFormData(prev => ({
        ...prev,
        selectedConditions: Array.from(allConditions)
      }));
    } else if (formData.selectedBrands.length > 0) {
      // Si hay otras marcas seleccionadas, seleccionar todos los estados generales
      setFormData(prev => ({
        ...prev,
        selectedConditions: ["Nuevo", "Usado", "Reacondicionado"]
      }));
    }
  };

  const handleClearAllConditions = () => {
    setFormData(prev => ({
      ...prev,
      selectedConditions: []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.selectedBrands.length === 0) {
      alert("Por favor, selecciona al menos una marca de interés");
      return;
    }

    setIsSubmitting(true);

    try {
      // Aquí iría la lógica para enviar el formulario
      console.log("Formulario enviado:", formData);

      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mostrar mensaje de éxito
      alert("¡Gracias! Te contactaremos pronto con información detallada sobre productos y precios.");

      // Resetear formulario
      setFormData({
        fullName: "",
        companyName: "",
        email: "",
        phone: "",
        selectedBrands: [],
        selectedModels: [],
        selectedConditions: [],
        message: ""
      });
      setAcceptCommunications(false);

    } catch (error) {
      alert("Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAppleSelected = formData.selectedBrands.includes("Apple");
  const hasAnySelection = formData.selectedBrands.length > 0 || formData.selectedModels.length > 0 || formData.selectedConditions.length > 0;

  return (
    <section id="contacto" className="bg-gradient-to-br from-brand-white via-brand-gray to-brand-white py-16 sm:py-20 flex flex-col items-center justify-center relative">
      {/* Texto de fondo VERSALTECH */}
      <div
        ref={backgroundRef}
        className="absolute top-[-40px] sm:top-[-40px] left-0 right-0 flex justify-center pointer-events-none"
        style={backgroundAnimation}
      >
        <div className="bg-gradient-to-b from-[#161614] to-[#16161400] bg-clip-text text-transparent opacity-5">
          <span
            className="font-bold leading-none"
            style={{
              fontSize: 'clamp(4rem, 16.5vw, 100rem)',
              width: '100vw',
              textAlign: 'center',
              letterSpacing: '-0.05em'
            }}
          >
            VERSALTECH
          </span>
        </div>
      </div>

      {/* Texto de la sección */}
      <div className="container mx-auto px-4 text-center mb-8 sm:mb-12">
        <div className="max-w-4xl mx-auto">
          <h1
            ref={titleRef}
            className="text-brand-black mb-4 sm:mb-6 text-[34px] sm:text-[42px] md:text-[52px] leading-tight px-2 sm:px-0"
            style={titleAnimation}
          >
            <span className="block sm:inline">¿LISTO PARA SUBIR DE NIVEL?</span>{" "}
            <div className="text-highlight inline-block" style={{ transform: 'translateY(-2px) rotate(-1deg)' }}>
              <div className="text-highlight-content">¡VAMOS A ELLO!</div>
            </div>
          </h1>
          <div className="opacity-60">
            <p
              ref={subtitleRef}
              className="text-base sm:text-lg text-brand-black/70 mb-2 max-w-[500px] sm:max-w-[600px] mx-auto px-4 sm:px-0 leading-relaxed"
              style={subtitleAnimation}
            >
              Únete a cientos de empresas que ya confían en VersalTechB2B para su suministro de Tecnología. <span className="hidden">Nuestro equipo está listo para ayudarte a crecer.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-8 bg-gradient-to-br from-brand-gray/20 to-highlight/10 border border-brand-gray/200">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="w-full"
            style={formAnimation}
          >

            {/* Selección de productos - Sistema de 3 columnas */}
            <div className="mb-8">
              <h3 className="text-lg text-brand-black mb-6 text-left uppercase" style={{ fontWeight: '700', lineHeight: '1' }}>
                Me gustaría recibir información sobre:
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna 1: Marcas */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base font-medium text-brand-black text-left sm:text-center">Marcas</h4>

                  <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={brandOpen}
                        className="w-full justify-between"
                      >
                        {formData.selectedBrands.length === 0
                          ? "Selecciona las marcas"
                          : `${formData.selectedBrands.length} marca(s) seleccionada(s)`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar marcas..." />
                        <CommandList>
                          <CommandEmpty>No se encontraron marcas.</CommandEmpty>
                          <CommandGroup>
                            <div className="p-2 border-b">
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleSelectAllBrands}
                                >
                                  Seleccionar todas
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleClearAllBrands}
                                >
                                  Limpiar
                                </Button>
                              </div>
                            </div>

                            {Object.entries(productFamilies).map(([brand, data]) => (
                              <CommandItem
                                key={brand}
                                onSelect={() => handleBrandToggle(brand)}
                              >
                                <Checkbox
                                  checked={formData.selectedBrands.includes(brand)}
                                />
                                <span>{brand}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Mostrar marcas seleccionadas */}
                  {formData.selectedBrands.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-brand-black/70 mb-2">
                        Marcas seleccionadas:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.selectedBrands.map((brand) => {
                          const brandData = productFamilies[brand as keyof typeof productFamilies];
                          const IconComponent = brandData.icon;
                          return (
                            <span
                              key={brand}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1"
                            >
                              <IconComponent className="w-3 h-3" />
                              {brand}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna 2: Modelos/Categorías */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base font-medium text-brand-black text-left sm:text-center">
                    {isAppleSelected && formData.selectedBrands.length === 1 ? "Modelos Apple" : "Modelos y Categorías"}
                  </h4>

                  {formData.selectedBrands.length > 0 ? (
                    <>
                      <Popover open={modelOpen} onOpenChange={setModelOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={modelOpen}
                            className="w-full justify-between"
                          >
                            {formData.selectedModels.length === 0
                              ? "Selecciona modelos/categorías"
                              : `${formData.selectedModels.length} elemento(s) seleccionado(s)`}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar modelos o categorías..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron opciones.</CommandEmpty>
                              <CommandGroup>
                                <div className="p-2 border-b">
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={handleSelectAllModels}
                                    >
                                      Seleccionar todos
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={handleClearAllModels}
                                    >
                                      Limpiar
                                    </Button>
                                  </div>
                                </div>

                                {/* Modelos de Apple (si Apple está seleccionado) */}
                                {isAppleSelected && (
                                  <>
                                    <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b border-gray-200">
                                      Modelos Apple
                                    </div>
                                    {Object.keys(productFamilies.Apple.models).map((model) => (
                                      <CommandItem
                                        key={`apple-${model}`}
                                        onSelect={() => handleModelToggle(model)}
                                      >
                                        <Checkbox
                                          checked={formData.selectedModels.includes(model)}
                                        />
                                        <span>{model}</span>
                                      </CommandItem>
                                    ))}
                                  </>
                                )}

                                {/* Categorías generales (si hay marcas no-Apple seleccionadas) */}
                                {formData.selectedBrands.some(brand => brand !== "Apple") && (
                                  <>
                                    <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b border-gray-200">
                                      Categorías Generales
                                    </div>
                                    {["Smartphones", "Portátiles", "Tablets", "Otros dispositivos"].map((category) => (
                                      <CommandItem
                                        key={`general-${category}`}
                                        onSelect={() => handleModelToggle(category)}
                                      >
                                        <Checkbox
                                          checked={formData.selectedModels.includes(category)}
                                        />
                                        <span>{category}</span>
                                      </CommandItem>
                                    ))}
                                  </>
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Mostrar elementos seleccionados */}
                      {formData.selectedModels.length > 0 && (
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-brand-black/70 mb-2">
                            Elementos seleccionados:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {formData.selectedModels.map((item) => {
                              const isAppleModel = Object.keys(productFamilies.Apple.models).includes(item);
                              return (
                                <span
                                  key={item}
                                  className={`px-2 py-1 text-xs rounded-full ${isAppleModel
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-green-100 text-green-800'
                                    }`}
                                >
                                  {item}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 bg-gray-100 rounded-md text-center">
                      <p className="text-sm text-gray-500">
                        Selecciona marcas para ver opciones disponibles
                      </p>
                    </div>
                  )}
                </div>

                {/* Columna 3: Estados */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base font-medium text-brand-black text-left sm:text-center">
                    Estados
                  </h4>

                  {isAppleSelected ? (
                    <>
                      <Popover open={conditionOpen} onOpenChange={setConditionOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={conditionOpen}
                            className="w-full justify-between"
                          >
                            {formData.selectedConditions.length === 0
                              ? "Selecciona los estados"
                              : `${formData.selectedConditions.length} estado(s) seleccionado(s)`}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar estados..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron estados.</CommandEmpty>
                              <CommandGroup>
                                <div className="p-2 border-b">
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={handleSelectAllConditions}
                                    >
                                      Seleccionar todos
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={handleClearAllConditions}
                                    >
                                      Limpiar
                                    </Button>
                                  </div>
                                </div>

                                {Object.values(productFamilies.Apple.models).flatMap(model =>
                                  model.conditions
                                ).filter((condition, index, arr) =>
                                  arr.indexOf(condition) === index
                                ).map((condition) => (
                                  <CommandItem
                                    key={condition}
                                    onSelect={() => handleConditionToggle(condition)}
                                  >
                                    <Checkbox
                                      checked={formData.selectedConditions.includes(condition)}
                                    />
                                    <span>{condition}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Mostrar estados seleccionados */}
                      {formData.selectedConditions.length > 0 && (
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-brand-black/70 mb-2">
                            Estados seleccionados:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {formData.selectedConditions.map((condition) => (
                              <span
                                key={condition}
                                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                              >
                                {condition}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : formData.selectedBrands.length > 0 ? (
                    <>
                      <Popover open={conditionOpen} onOpenChange={setConditionOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={conditionOpen}
                            className="w-full justify-between"
                          >
                            {formData.selectedConditions.length === 0
                              ? "Selecciona los estados"
                              : `${formData.selectedConditions.length} estado(s) seleccionado(s)`}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar estados..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron estados.</CommandEmpty>
                              <CommandGroup>
                                <div className="p-2 border-b">
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={handleSelectAllConditions}
                                    >
                                      Seleccionar todos
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={handleClearAllConditions}
                                    >
                                      Limpiar
                                    </Button>
                                  </div>
                                </div>

                                {["Nuevo", "Usado", "Reacondicionado"].map((condition) => (
                                  <CommandItem
                                    key={condition}
                                    onSelect={() => handleConditionToggle(condition)}
                                  >
                                    <Checkbox
                                      checked={formData.selectedConditions.includes(condition)}
                                    />
                                    <span>{condition}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Mostrar estados seleccionados */}
                      {formData.selectedConditions.length > 0 && (
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-brand-black/70 mb-2">
                            Estados seleccionados:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {formData.selectedConditions.map((condition) => (
                              <span
                                key={condition}
                                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                              >
                                {condition}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 bg-gray-100 rounded-md text-center">
                      <p className="text-sm text-gray-500">
                        Selecciona marcas para ver estados disponibles
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-brand-black mb-2">
                  Nombre completo
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nombre y apellidos"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="h-12"
                  required
                />
              </div>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-brand-black mb-2">
                  Nombre de la empresa
                </label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Ej. Empresa S.L."
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="h-12"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-black mb-2">
                  Dirección de email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@address.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="h-12"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-brand-black mb-2">
                  Número telefónico
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="h-12"
                  required
                />
              </div>
            </div>

            {/* Campo de mensaje */}
            <div className="mb-6 sm:mb-8">
              <label htmlFor="message" className="block text-sm font-medium text-brand-black mb-2">
                Mensaje adicional (opcional)
              </label>
              <Textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Cuéntanos más sobre tus necesidades específicas, requisitos o cualquier información adicional que consideres importante..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>

            {/* Consentimiento de comunicaciones */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="privacy-policy"
                  checked={acceptCommunications}
                  onCheckedChange={(checked) => setAcceptCommunications(checked === true)}
                />
                <Label htmlFor="privacy-policy" className="text-sm text-normal leading-relaxed cursor-pointer">
                  Acepto la {" "}<a href="#" className="text-blue-600 hover:underline">Política de privacidad</a>
                </Label>
              </div>
            </div>

            {/* Botón de envío */}
            <div className="text-center mb-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-12 text-brand-neon font-semibold text-lg h-14 transition-all duration-300 hover:scale-103 hover:rotate-1"
                style={{
                  boxShadow: '0px 4px 84px 0px rgba(110, 252, 211, 1.00)'
                }}
              >
                {isSubmitting ? "ENVIANDO..." : "SOLICITAR PRESUPUESTO"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

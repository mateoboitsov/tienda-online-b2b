"use client";

import { useState, useRef, useEffect } from 'react';

// Utilidades de animaciones reutilizables
export const animations = {
  fadeInUp: 'fadeInUp 0.8s ease-in-out',
  fadeInScale: 'fadeInScale 0.8s ease-in-out',
  fadeInLeft: 'fadeInLeft 0.8s ease-in-out',
  fadeInRight: 'fadeInRight 0.8s ease-in-out',
  fadeInDown: 'fadeInDown 0.8s ease-in-out',
  slideInUp: 'slideInUp 0.6s ease-in-out',
  slideInDown: 'slideInDown 0.6s ease-in-out',
  bounceIn: 'bounceIn 0.8s ease-in-out',
  zoomIn: 'zoomIn 0.6s ease-in-out',
};

// Función helper para crear animaciones con delay
export const createAnimation = (type: keyof typeof animations, delay: number = 0) => {
  return `${animations[type]} ${delay}s both`;
};

// Función helper para crear animaciones escalonadas
export const createStaggeredAnimation = (type: keyof typeof animations, baseDelay: number, staggerDelay: number = 0.1) => {
  return (index: number) => createAnimation(type, baseDelay + (index * staggerDelay));
};

// Hook personalizado para animaciones basadas en viewport
export const useViewportAnimation = <T extends HTMLElement = HTMLElement>(
  animationType: keyof typeof animations,
  threshold: number = 0.00000001,
  rootMargin: string = '0px'
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [threshold, rootMargin, hasAnimated]);

  const animationStyle = isVisible
    ? {
        animation: animations[animationType],
        opacity: 1,
      }
    : {
        opacity: 0,
      };

  return { elementRef, animationStyle, isVisible };
 };

// Hook para animaciones escalonadas basadas en viewport
export const useViewportStaggeredAnimation = (
  animationType: keyof typeof animations,
  itemsPerRow: number = 3,
  staggerDelay: number = 0.1,
  threshold: number = 0.00000001,
  rootMargin: string = '0px'
) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting && !visibleItems.has(index)) {
            setVisibleItems((prev: Set<number>) => new Set([...prev, index]));
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (containerRef.current) {
      const children = containerRef.current.querySelectorAll('[data-index]');
      children.forEach((child: Element) => observer.observe(child));
    }

    return () => {
      if (containerRef.current) {
        const children = containerRef.current.querySelectorAll('[data-index]');
        children.forEach((child: Element) => observer.unobserve(child));
      }
    };
  }, [threshold, rootMargin, visibleItems]);

  const getItemAnimationStyle = (index: number) => {
    const isVisible = visibleItems.has(index);
    if (!isVisible) {
      return { opacity: 0 };
    }

    // Calcular el delay basado en la posición en la fila
    // Esto crea el patrón: 0, 0.1, 0.2, 0, 0.1, 0.2, 0, 0.1, 0.2...
    const positionInRow = index % itemsPerRow;
    const delay = positionInRow * staggerDelay;
    
    return {
      animation: createAnimation(animationType, delay),
      opacity: 1,
    };
  };

  return { containerRef, getItemAnimationStyle };
};

// Estilos CSS globales para las animaciones
export const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes zoomIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

"use client";

import { Clock, CheckCircle, User } from "lucide-react";

interface StatusIndicatorProps {
  status: 'pending' | 'approved';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({ status, size = 'md' }: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <div className="relative inline-block">
      {/* Icono principal */}
      <div className="bg-gray-100 rounded-full p-2">
        <User className="h-6 w-6 text-gray-600" />
      </div>
      
      {/* Indicador de estado */}
      {status === 'pending' && (
        <div className={`absolute -top-1 -right-1 ${sizeClasses[size]} bg-orange-500 rounded-full flex items-center justify-center border-2 border-white`}>
          <Clock className={`${iconSizes[size]} text-white`} />
        </div>
      )}
      
      {status === 'approved' && (
        <div className={`absolute -top-1 -right-1 ${sizeClasses[size]} bg-green-500 rounded-full flex items-center justify-center border-2 border-white`}>
          <CheckCircle className={`${iconSizes[size]} text-white`} />
        </div>
      )}
    </div>
  );
}

// Componente de demostración
export function StatusIndicatorDemo() {
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold">Indicadores de Estado Visual</h3>
      
      <div className="flex items-center gap-6">
        <div className="text-center">
          <StatusIndicator status="pending" size="sm" />
          <p className="text-sm text-gray-600 mt-2">Pendiente (Pequeño)</p>
        </div>
        
        <div className="text-center">
          <StatusIndicator status="pending" size="md" />
          <p className="text-sm text-gray-600 mt-2">Pendiente (Mediano)</p>
        </div>
        
        <div className="text-center">
          <StatusIndicator status="pending" size="lg" />
          <p className="text-sm text-gray-600 mt-2">Pendiente (Grande)</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-center">
          <StatusIndicator status="approved" size="sm" />
          <p className="text-sm text-gray-600 mt-2">Aprobado (Pequeño)</p>
        </div>
        
        <div className="text-center">
          <StatusIndicator status="approved" size="md" />
          <p className="text-sm text-gray-600 mt-2">Aprobado (Mediano)</p>
        </div>
        
        <div className="text-center">
          <StatusIndicator status="approved" size="lg" />
          <p className="text-sm text-gray-600 mt-2">Aprobado (Grande)</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, Lock, User, AlertCircle, CheckCircle, MapPin, Phone, Hash, Globe } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormData {
  email: string;
  password: string;
  company: string;
  name: string;
  country: string;
  cif: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  company?: string;
  name?: string;
  country?: string;
  cif?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
}

export default function B2BLogin() {
  const { user, supabase } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    company: '',
    name: '',
    country: 'España',
    cif: '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.email) {
      errors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Formato de email inválido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!isLogin) {
      if (!formData.company) {
        errors.company = 'El nombre de la empresa es obligatorio';
      }
      if (!formData.name) {
        errors.name = 'El nombre es obligatorio';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        setMessage({ type: 'success', text: 'Inicio de sesión exitoso' });
        router.refresh(); // Crucial para que el server capte la nueva sesión

        setTimeout(() => {
          router.push('/productos');
        }, 1000);
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              company: formData.company,
              name: formData.name,
              country: formData.country,
              cif: formData.cif,
              address: formData.address,
              city: formData.city,
              postalCode: formData.postalCode,
              phone: formData.phone,
            }
          }
        });

        if (error) throw error;

        setMessage({
          type: 'success',
          text: 'Registro exitoso. Por favor revisa tu email para confirmar tu cuenta.'
        });

        setFormData({
          email: '',
          password: '',
          company: '',
          name: '',
          country: 'España',
          cif: '',
          address: '',
          city: '',
          postalCode: '',
          phone: ''
        });

        setTimeout(() => {
          setIsLogin(true);
          setMessage(null);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: error.message || 'Ocurrió un error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage(null);
    setFormErrors({});
    setFormData({
      email: '',
      password: '',
      company: '',
      name: '',
      country: 'España',
      cif: '',
      address: '',
      city: '',
      postalCode: '',
      phone: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Iniciar Sesión B2B' : 'Registro B2B'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Accede a tu cuenta empresarial'
              : 'Crea tu cuenta empresarial'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {message && (
            <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                      Empresa *
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        required
                        className={`pl-10 ${formErrors.company ? 'border-red-500' : ''}`}
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Nombre de tu empresa"
                      />
                    </div>
                    {formErrors.company && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.company}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Nombre *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className={`pl-10 ${formErrors.name ? 'border-red-500' : ''}`}
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cif" className="text-sm font-medium text-gray-700">
                      CIF/NIF
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="cif"
                        name="cif"
                        type="text"
                        className={`pl-10 ${formErrors.cif ? 'border-red-500' : ''}`}
                        value={formData.cif}
                        onChange={(e) => handleInputChange('cif', e.target.value)}
                        placeholder="CIF/NIF de la empresa"
                      />
                    </div>
                    {formErrors.cif && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.cif}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      País
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="country"
                        name="country"
                        type="text"
                        className={`pl-10 ${formErrors.country ? 'border-red-500' : ''}`}
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        placeholder="País"
                      />
                    </div>
                    {formErrors.country && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.country}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Dirección
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      className={`pl-10 ${formErrors.address ? 'border-red-500' : ''}`}
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Dirección de la empresa"
                    />
                  </div>
                  {formErrors.address && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                      Ciudad
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        className={`pl-10 ${formErrors.city ? 'border-red-500' : ''}`}
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Ciudad"
                      />
                    </div>
                    {formErrors.city && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                      Código Postal
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        className={`pl-10 ${formErrors.postalCode ? 'border-red-500' : ''}`}
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        placeholder="Código Postal"
                      />
                    </div>
                    {formErrors.postalCode && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.postalCode}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Teléfono
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        className={`pl-10 ${formErrors.phone ? 'border-red-500' : ''}`}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Teléfono de contacto"
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`pl-10 ${formErrors.email ? 'border-red-500' : ''}`}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="tu@empresa.com"
                  autoComplete="username"
                />
              </div>
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className={`pl-10 ${formErrors.password ? 'border-red-500' : ''}`}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Tu contraseña"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading
                ? (isLogin ? 'Iniciando sesión...' : 'Registrando...')
                : (isLogin ? 'Iniciar Sesión' : 'Registrarse')
              }
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                {isLogin
                  ? '¿No tienes cuenta? Regístrate'
                  : '¿Ya tienes cuenta? Inicia sesión'
                }
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div >
  );
}

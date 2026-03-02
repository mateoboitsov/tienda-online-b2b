"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2, Mail, Lock, User, AlertCircle, CheckCircle,
  MapPin, Phone, Hash, Globe, Clock, MessageCircle, ArrowLeft, RefreshCw
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// WhatsApp number (from header contact)
const WHATSAPP_NUMBER = '351928399390';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hola, acabo de registrarme en VersalTech B2B y me gustaría acelerar la aprobación de mi cuenta.'
);

type Step = 'login' | 'register' | 'otp' | 'pending';

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
}

export default function B2BLogin() {
  const { supabase } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('login');
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
  const [error, setError] = useState<string | null>(null);

  // OTP state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ─── Validation ──────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.email) errors.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Formato de email inválido';
    if (!formData.password) errors.password = 'La contraseña es obligatoria';
    else if (formData.password.length < 6) errors.password = 'Mínimo 6 caracteres';
    if (step === 'register') {
      if (!formData.company) errors.company = 'El nombre de la empresa es obligatorio';
      if (!formData.name) errors.name = 'El nombre es obligatorio';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── OTP input handling ───────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 7) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    if (pasted.length === 8) {
      setOtpDigits(pasted.split(''));
      otpRefs.current[7]?.focus();
    }
  };

  const otpCode = otpDigits.join('');

  // ─── Login ────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (signInError) throw signInError;

      // Check approval status
      const { data: dbUser } = await supabase
        .from('users')
        .select('approved')
        .eq('email', formData.email)
        .single();

      if (dbUser && !dbUser.approved) {
        setStep('pending');
        return;
      }

      router.refresh();
      const searchParams = new URLSearchParams(window.location.search);
      const redirectedFrom = searchParams.get('redirectedFrom');
      setTimeout(() => router.push(redirectedFrom || '/productos'), 500);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // ─── Register ─────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
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
      if (signUpError) throw signUpError;

      // Move to OTP step
      setStep('otp');
      startResendCooldown();
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  // ─── Verify OTP ───────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 8) {
      setError('Introduce los 8 dígitos del código');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otpCode,
        type: 'signup',
      });
      if (verifyError) throw verifyError;

      // Create user in public.users
      await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // Notify admin
      fetch('/api/notify/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          country: formData.country,
          phone: formData.phone,
        }),
      }).catch(console.error);

      // Sign out so they don't think they're logged in (they need approval)
      await supabase.auth.signOut();

      setStep('pending');
    } catch (err: any) {
      setError(err.message === 'Token has expired or is invalid'
        ? 'Código incorrecto o expirado. Solicita un nuevo código.'
        : err.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP ───────────────────────────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    try {
      await supabase.auth.resend({ type: 'signup', email: formData.email });
      startResendCooldown();
      setOtpDigits(['', '', '', '', '', '', '', '']);
    } catch (err: any) {
      setError('Error al reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // ─── Submit handler ───────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'login') await handleLogin();
    else if (step === 'register') await handleRegister();
  };

  // ─── PENDING SCREEN ───────────────────────────────────────────────────
  if (step === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">


            <div className="p-8 text-center">
              {/* Icon */}
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-12 h-12 text-amber-500" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Registro completado!
              </h1>
              <p className="text-gray-500 mb-8">
                Tu cuenta está pendiente de aprobación por parte del administrador.
                Te avisaremos por email cuando esté lista.
              </p>

              {/* Steps */}
              <div className="space-y-3 text-left mb-8">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-green-800 font-medium">Email verificado</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 animate-pulse" />
                  <span className="text-sm text-amber-800 font-medium">Esperando aprobación del administrador</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl opacity-50">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  <span className="text-sm text-gray-600 font-medium">Acceso a la tienda B2B</span>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="bg-green-50 rounded-2xl p-5 mb-6 text-left">
                <p className="text-sm text-green-800 font-medium mb-3">
                  ¿Quieres acelerar el proceso?
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contactar por WhatsApp
                </a>
              </div>

              <button
                onClick={() => { setStep('login'); setFormData({ email: '', password: '', company: '', name: '', country: 'España', cif: '', address: '', city: '', postalCode: '', phone: '' }); }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── OTP SCREEN ───────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 text-brand-black">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-8">
              {/* Back button */}
              <button
                onClick={() => { setStep('register'); setOtpDigits(['', '', '', '', '', '', '', '']); setError(null); }}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>

              {/* Icon */}
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                <Mail className="w-8 h-8 text-blue-500" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-1">Verifica tu email</h1>
              <p className="text-gray-500 mb-6 text-sm">
                Hemos enviado un código de 8 dígitos a{' '}
                <span className="font-semibold text-gray-700">{formData.email}</span>
              </p>

              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {/* OTP Boxes - Optimized for 8 digits */}
              <div className="flex items-center gap-1 sm:gap-2 mb-8" onPaste={handleOtpPaste}>
                <div className="grid grid-cols-4 gap-1 sm:gap-2 flex-1">
                  {otpDigits.slice(0, 4).map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className={`w-full h-12 text-center text-lg font-bold border-2 rounded-lg outline-none transition-all duration-200 ${digit
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 text-gray-900'
                        } focus:border-blue-500 focus:bg-blue-50`}
                    />
                  ))}
                </div>

                <div className="w-2 h-0.5 bg-gray-300 mx-1 flex-shrink-0" />

                <div className="grid grid-cols-4 gap-1 sm:gap-2 flex-1">
                  {otpDigits.slice(4, 8).map((digit, i) => {
                    const idx = i + 4;
                    return (
                      <input
                        key={idx}
                        ref={el => { otpRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        className={`w-full h-12 text-center text-lg font-bold border-2 rounded-lg outline-none transition-all duration-200 ${digit
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-gray-50 text-gray-900'
                          } focus:border-blue-500 focus:bg-blue-50`}
                      />
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={loading || otpCode.length !== 8}
                className="w-full h-12 font-bold text-base mb-4 rounded-xl"
              >
                {loading ? 'Verificando...' : 'Verificar código'}
              </Button>

              {/* Resend */}
              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-gray-400">
                    Puedes reenviar en {resendCooldown}s
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mx-auto transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reenviar código
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── LOGIN / REGISTER FORM ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-xl w-full shadow-xl rounded-3xl border-none overflow-hidden">

        <CardHeader className="text-center pt-8">
          <CardTitle className="text-3xl font-bold text-gray-900">
            {step === 'login' ? 'Iniciar Sesión' : 'Crear cuenta B2B'}
          </CardTitle>
          <CardDescription>
            {step === 'login'
              ? 'Accede a tu cuenta empresarial'
              : 'Rellena tus datos para solicitar acceso'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Register extra fields */}
            {step === 'register' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium text-gray-700">Empresa *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="company" type="text" required
                        className={`pl-10 ${formErrors.company ? 'border-red-500' : ''}`}
                        value={formData.company}
                        onChange={e => handleInputChange('company', e.target.value)}
                        placeholder="Nombre de tu empresa"
                      />
                    </div>
                    {formErrors.company && <p className="text-red-500 text-xs">{formErrors.company}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nombre *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name" type="text" required
                        className={`pl-10 ${formErrors.name ? 'border-red-500' : ''}`}
                        value={formData.name}
                        onChange={e => handleInputChange('name', e.target.value)}
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    {formErrors.name && <p className="text-red-500 text-xs">{formErrors.name}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cif" className="text-sm font-medium text-gray-700">CIF/NIF</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="cif" type="text"
                        className="pl-10"
                        value={formData.cif}
                        onChange={e => handleInputChange('cif', e.target.value)}
                        placeholder="CIF/NIF de la empresa"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">País</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="country" type="text"
                        className="pl-10"
                        value={formData.country}
                        onChange={e => handleInputChange('country', e.target.value)}
                        placeholder="País"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">Dirección</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="address" type="text"
                      className="pl-10"
                      value={formData.address}
                      onChange={e => handleInputChange('address', e.target.value)}
                      placeholder="Dirección de la empresa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">Ciudad</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="city" type="text"
                        className="pl-10"
                        value={formData.city}
                        onChange={e => handleInputChange('city', e.target.value)}
                        placeholder="Ciudad"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">C.P.</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="postalCode" type="text"
                        className="pl-10"
                        value={formData.postalCode}
                        onChange={e => handleInputChange('postalCode', e.target.value)}
                        placeholder="Código Postal"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone" type="tel"
                        className="pl-10"
                        value={formData.phone}
                        onChange={e => handleInputChange('phone', e.target.value)}
                        placeholder="+34 600 000 000"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email" type="email" required autoComplete="username"
                  className={`pl-10 ${formErrors.email ? 'border-red-500' : ''}`}
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder="tu@empresa.com"
                />
              </div>
              {formErrors.email && <p className="text-red-500 text-xs">{formErrors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password" type="password" required minLength={6}
                  autoComplete={step === 'login' ? 'current-password' : 'new-password'}
                  className={`pl-10 ${formErrors.password ? 'border-red-500' : ''}`}
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  placeholder="Tu contraseña"
                />
              </div>
              {formErrors.password && <p className="text-red-500 text-xs">{formErrors.password}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 font-bold text-base rounded-xl">
              {loading
                ? (step === 'login' ? 'Iniciando sesión...' : 'Registrando...')
                : (step === 'login' ? 'Iniciar Sesión' : 'Crear cuenta y recibir código')
              }
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep(step === 'login' ? 'register' : 'login');
                  setError(null);
                  setFormErrors({});
                  setFormData({ email: '', password: '', company: '', name: '', country: 'España', cif: '', address: '', city: '', postalCode: '', phone: '' });
                }}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                {step === 'login'
                  ? '¿No tienes cuenta? Regístrate'
                  : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

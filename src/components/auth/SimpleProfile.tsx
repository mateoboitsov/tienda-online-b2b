"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateUser } from "@/lib/services/usersService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Mail, User, MapPin, Hash, Phone, Globe, FileText, Save, Edit, X } from "lucide-react";

export function SimpleProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    cif: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'España',
    phone: ''
  });

  // Cargar datos del usuario desde el contexto
  useEffect(() => {
    if (user) {
      setFormData({
        company: user.company || '',
        name: user.name || '',
        cif: user.cif || '',
        address: user.address || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
        country: user.country || 'España',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Guardar cambios
  const saveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);

      await updateUser(user.id, {
        company: formData.company,
        name: formData.name,
        cif: formData.cif || null,
        address: formData.address || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        country: formData.country,
        phone: formData.phone || null
      });

      // Revalidar datos del servidor
      router.refresh();
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Error guardando perfil:', error);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (user) {
      setFormData({
        company: user.company || '',
        name: user.name || '',
        cif: user.cif || '',
        address: user.address || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
        country: user.country || 'España',
        phone: user.phone || ''
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">No se encontró información del usuario</p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">Mi Perfil B2B</CardTitle>
          <CardDescription>Gestiona tu cuenta empresarial</CardDescription>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company">Nombre de la empresa *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cif">CIF/NIF</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="cif"
                    value={formData.cif}
                    onChange={(e) => setFormData(prev => ({ ...prev, cif: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Código Postal *</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">País *</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="España">🇪🇸 España</SelectItem>
                    <SelectItem value="Portugal">🇵🇹 Portugal</SelectItem>
                    <SelectItem value="Francia">🇫🇷 Francia</SelectItem>
                    <SelectItem value="Alemania">🇩🇪 Alemania</SelectItem>
                    <SelectItem value="Italia">🇮🇹 Italia</SelectItem>
                    <SelectItem value="Reino Unido">🇬🇧 Reino Unido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <Button onClick={cancelEdit} variant="outline" disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={saveProfile} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Nombre de la empresa</Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{user.company || 'No especificado'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Nombre</Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{user.name || 'No especificado'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">CIF/NIF</Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{user.cif || 'No especificado'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Dirección</Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{user.address || 'No especificado'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Ciudad</Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{user.city || 'No especificado'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Código Postal</Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{user.postal_code || 'No especificado'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">País</Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{user.country || 'España'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{user.phone || 'No especificado'}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

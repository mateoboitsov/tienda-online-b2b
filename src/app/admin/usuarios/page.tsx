"use client";

import { useEffect, useState } from "react";
import { getAllUsers, getPendingUsers, updateUser, deleteUser, User } from "@/lib/services/usersService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock, User as UserIcon, Building, Mail, Calendar } from "lucide-react";

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const [allUsers, pending] = await Promise.all([
        getAllUsers(),
        getPendingUsers()
      ]);
      setUsers(allUsers);
      setPendingUsers(pending);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage({ type: 'error', text: 'Error al cargar usuarios' });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const user = await updateUser(userId, { approved: true });
      if (user) {
        setMessage({ type: 'success', text: 'Usuario aprobado correctamente' });
        await loadUsers(); // Recargar la lista
      } else {
        setMessage({ type: 'error', text: 'Error al aprobar usuario' });
      }
    } catch (error) {
      console.error('Error approving user:', error);
      setMessage({ type: 'error', text: 'Error al aprobar usuario' });
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres rechazar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const success = await deleteUser(userId);
      if (success) {
        setMessage({ type: 'success', text: 'Usuario rechazado correctamente' });
        await loadUsers(); // Recargar la lista
      } else {
        setMessage({ type: 'error', text: 'Error al rechazar usuario' });
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      setMessage({ type: 'error', text: 'Error al rechazar usuario' });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const user = await updateUser(userId, { role: newRole });
      if (user) {
        setMessage({ type: 'success', text: 'Rol de usuario actualizado correctamente' });
        await loadUsers(); // Recargar la lista
      } else {
        setMessage({ type: 'error', text: 'Error al actualizar rol de usuario' });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      setMessage({ type: 'error', text: 'Error al actualizar rol de usuario' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-600">Aprobar y gestionar el acceso de usuarios a la tienda</p>
            </div>
          </div>

          {message && (
            <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto gap-1 md:gap-0">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendientes ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Aprobados ({users.filter(u => u.approved).length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Todos ({users.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Usuarios Pendientes */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Usuarios Pendientes de Aprobación
                </CardTitle>
                <CardDescription>
                  Estos usuarios se han registrado pero aún no han sido aprobados para acceder a la tienda
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loadingUsers ? (
                  <div className="text-center py-8 px-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando usuarios...</p>
                  </div>
                ) : pendingUsers.length === 0 ? (
                  <div className="text-center py-8 px-6 text-gray-500 border-t border-gray-100">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No hay usuarios pendientes de aprobación</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre / Empresa</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Registro</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {pendingUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-gray-500 text-xs">{user.company}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDate(user.created_at)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                              <Button
                                onClick={() => handleApproveUser(user.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 h-8"
                              >
                                Aprobar
                              </Button>
                              <Button
                                onClick={() => handleRejectUser(user.id)}
                                size="sm"
                                variant="destructive"
                                className="h-8"
                              >
                                Rechazar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Usuarios Aprobados */}
          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Usuarios Aprobados
                </CardTitle>
                <CardDescription>
                  Usuarios que tienen acceso completo a la tienda
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loadingUsers ? (
                  <div className="text-center py-8 px-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando usuarios...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre / Empresa</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Registro</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {users.filter(u => u.approved).map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-gray-500 text-xs">{user.company}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDate(user.created_at)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Select
                                value={user.role}
                                onValueChange={(value) => handleUpdateRole(user.id, value)}
                              >
                                <SelectTrigger className="h-8 w-28 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Usuario</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Todos los Usuarios */}
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-blue-500" />
                  Todos los Usuarios
                </CardTitle>
                <CardDescription>
                  Vista completa de todos los usuarios registrados en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loadingUsers ? (
                  <div className="text-center py-8 px-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando usuarios...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre / Empresa</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-gray-500 text-xs">{user.company}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                variant="secondary"
                                className={user.approved ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                              >
                                {user.approved ? 'Aprobado' : 'Pendiente'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Select
                                value={user.role}
                                onValueChange={(value) => handleUpdateRole(user.id, value)}
                              >
                                <SelectTrigger className="h-8 w-28 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Usuario</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right h-8">
                              {!user.approved && (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    onClick={() => handleApproveUser(user.id)}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 h-8"
                                  >
                                    Aprobar
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectUser(user.id)}
                                    size="sm"
                                    variant="destructive"
                                    className="h-8"
                                  >
                                    Rechazar
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

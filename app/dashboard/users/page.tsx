"use client"

import type React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Key, Shield, Trash2, UserCheck, UserPlus, Users, UserX } from "lucide-react"
import { useEffect, useState } from "react"

import { useToast } from "@/hooks/use-toast"

interface User {
  _id: string
  nombre: string
  primerApell: string
  segundoApell: string
  numTel: string
  correo: string
  idRol: string
  estado: boolean
}

interface Role {
  _id: string
  nombreRol: string
}

export default function UsersPage() {
  const { toast } = useToast()
  // Estados para búsqueda y filtros
  const [search, setSearch] = useState("");
  const [filterRol, setFilterRol] = useState("all");
  const [filterEstado, setFilterEstado] = useState("all");
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    primerApell: "",
    segundoApell: "",
    numTel: "",
    correo: "",
    idRol: "",
    estado: true,
  })
  
  // Nuevos estados para el diálogo de reinicio de contraseña
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await fetch("/api/roles")
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      console.error("Error loading roles:", error)
    }
  }

  // Funciones de validación
  const soloLetras = (texto: string) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(texto);
  const soloNumeros10 = (texto: string) => /^\d{10}$/.test(texto);
  const correoValido = (correo: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir múltiples envíos
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    // Validaciones generales
    if (!soloLetras(formData.nombre)) {
      toast({
        title: "❌ Error de validación",
        description: "El nombre solo debe contener letras y espacios.",
        variant: "destructive",
        duration: 4000,
      })
      setIsSubmitting(false);
      return;
    }
    if (!soloLetras(formData.primerApell)) {
      toast({
        title: "❌ Error de validación",
        description: "El primer apellido solo debe contener letras y espacios.",
        variant: "destructive",
        duration: 4000,
      })
      setIsSubmitting(false);
      return;
    }
    if (formData.segundoApell && !soloLetras(formData.segundoApell)) {
      toast({
        title: "❌ Error de validación",
        description: "El segundo apellido solo debe contener letras y espacios.",
        variant: "destructive",
        duration: 4000,
      })
      setIsSubmitting(false);
      return;
    }
    if (!soloNumeros10(formData.numTel)) {
      toast({
        title: "❌ Error de validación",
        description: "El número telefónico debe contener solo 10 dígitos numéricos.",
        variant: "destructive",
        duration: 4000,
      })
      setIsSubmitting(false);
      return;
    }
    // Validación de correo solo al crear usuario
    if (!editingUser && !correoValido(formData.correo)) {
      toast({
        title: "❌ Error de validación",
        description: "El correo electrónico no es válido.",
        variant: "destructive",
        duration: 4000,
      })
      setIsSubmitting(false);
      return;
    }
    
    // Validar que se haya seleccionado un rol
    if (!formData.idRol) {
      toast({
        title: "❌ Error de validación",
        description: "Debes seleccionar un rol para el usuario.",
        variant: "destructive",
        duration: 4000,
      })
      setIsSubmitting(false);
      return;
    }

    try {
      const url = editingUser ? `/api/users/${editingUser._id}` : "/api/users"
      const method = editingUser ? "PUT" : "POST"
      
      // Solo enviar los campos permitidos - CONVERTIR idRol a número
      const dataToSend = editingUser
        ? {
            nombre: formData.nombre,
            primerApell: formData.primerApell,
            segundoApell: formData.segundoApell,
            numTel: formData.numTel,
            estado: formData.estado,
            idRol: Number(formData.idRol),
          }
        : {
            nombre: formData.nombre,
            primerApell: formData.primerApell,
            segundoApell: formData.segundoApell,
            numTel: formData.numTel,
            correo: formData.correo,
            idRol: Number(formData.idRol),
          }
          
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })
      
      if (response.ok) {
        await loadUsers()
        setIsDialogOpen(false)
        setEditingUser(null)
        setFormData({
          nombre: "",
          primerApell: "",
          segundoApell: "",
          numTel: "",
          correo: "",
          idRol: "",
          estado: true,
        })
        toast({
          title: "✅ Usuario guardado",
          description: editingUser ? "Los datos del usuario han sido actualizados exitosamente." : "El nuevo usuario ha sido creado exitosamente.",
          duration: 4000,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Error al guardar",
          description: errorData.error || "No se pudo guardar el usuario. Por favor, verifica los datos e intenta nuevamente.",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error("Error saving user:", error)
      toast({
        title: "🔌 Error de conexión",
        description: "No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.",
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      nombre: user.nombre,
      primerApell: user.primerApell,
      segundoApell: user.segundoApell,
      numTel: user.numTel,
      correo: user.correo,
      idRol: String(user.idRol),
      estado: user.estado,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadUsers()
        toast({
          title: "✅ Usuario eliminado",
          description: "El usuario ha sido eliminado exitosamente del sistema.",
          duration: 4000,
        })
      } else {
        toast({
          title: "❌ Error al eliminar",
          description: "No se pudo eliminar el usuario. Por favor, intenta nuevamente.",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "🔌 Error de conexión",
        description: "No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.",
        variant: "destructive",
        duration: 6000,
      })
    }
  }

  const handleResetPassword = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "✅ Contraseña restablecida",
          description: "La contraseña del usuario ha sido restablecida exitosamente.",
          duration: 4000,
        })
        setResetPasswordDialogOpen(false)
      } else {
        toast({
          title: "❌ Error al restablecer",
          description: "No se pudo restablecer la contraseña. Por favor, intenta nuevamente.",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      toast({
        title: "🔌 Error de conexión",
        description: "No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.",
        variant: "destructive",
        duration: 6000,
      })
    }
  }

  // Obtiene el nombre del rol para un usuario
  const getRoleName = (user: User) => {
    return roles.find(r => r._id === user.idRol)?.nombreRol?.toLowerCase() || "";
  }

  // Total de administradores
  const getAdminCount = () => {
    return users.filter((user) => getRoleName(user) === "administrador").length;
  }

  // Total de usuarios activos
  const getActiveCount = () => {
    return users.filter((user) => user.estado).length;
  }

  // Total de usuarios inactivos
  const getInactiveCount = () => {
    return users.filter((user) => !user.estado).length;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando usuarios...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">Administra usuarios y permisos del sistema</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="px-4 sm:px-6">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Nuevo Usuario</span>
                <span className="sm:hidden">Nuevo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl w-full mx-4">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">{editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  {editingUser ? "Modifica los datos del usuario" : "Completa los datos para crear un nuevo usuario"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full">
                {/* Nombre y Apellidos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="nombre" className="text-sm sm:text-base font-medium">Nombre</Label>
                    <Input id="nombre" value={formData.nombre} onChange={e => setFormData(prev => ({ ...prev, nombre: e.target.value }))} required className="text-sm sm:text-base h-10 sm:h-12" />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="primerApell" className="text-sm sm:text-base font-medium">Primer Apellido</Label>
                    <Input id="primerApell" value={formData.primerApell} onChange={e => setFormData(prev => ({ ...prev, primerApell: e.target.value }))} required className="text-sm sm:text-base h-10 sm:h-12" />
                  </div>
                  <div className="space-y-2 sm:space-y-3 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="segundoApell" className="text-sm sm:text-base font-medium">Segundo Apellido</Label>
                    <Input
                      id="segundoApell"
                      value={formData.segundoApell}
                      onChange={e => setFormData(prev => ({ ...prev, segundoApell: e.target.value }))}
                      className="text-sm sm:text-base h-10 sm:h-12"
                    />
                  </div>
                </div>
                {/* Información de contacto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="numTel" className="text-sm sm:text-base font-medium">Número Telefónico</Label>
                    <Input
                      id="numTel"
                      type="tel"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={formData.numTel}
                      onChange={e => setFormData(prev => ({ ...prev, numTel: e.target.value.replace(/\D/g, "") }))}
                      required
                      className="text-sm sm:text-base h-10 sm:h-12"
                    />
                  </div>
                  {!editingUser && (
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="correo" className="text-sm sm:text-base font-medium">Correo</Label>
                      <Input id="correo" type="email" value={formData.correo} onChange={e => setFormData(prev => ({ ...prev, correo: e.target.value }))} required className="text-sm sm:text-base h-10 sm:h-12" />
                    </div>
                  )}
                </div>
                {/* Rol y Estado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="idRol" className="text-sm sm:text-base font-medium">Rol</Label>
                    <Select
                      value={formData.idRol}
                      onValueChange={value => setFormData(prev => ({ ...prev, idRol: value }))}
                    >
                      <SelectTrigger className="text-sm sm:text-base h-10 sm:h-12">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role._id} value={String(role._id)} className="text-sm sm:text-base text-black">
                            {role.nombreRol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {editingUser && (
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="estado" className="text-sm sm:text-base font-medium">Estado</Label>
                      <Select value={formData.estado ? "true" : "false"} onValueChange={value => setFormData(prev => ({ ...prev, estado: value === "true" }))}>
                        <SelectTrigger className="text-sm sm:text-base h-10 sm:h-12">
                          <SelectValue placeholder="Selecciona estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true" className="text-sm sm:text-base">Activo</SelectItem>
                          <SelectItem value="false" className="text-sm sm:text-base">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-10 sm:h-12 px-4 sm:px-6">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="h-10 sm:h-12 px-4 sm:px-6">
                    {isSubmitting ? "Guardando..." : (editingUser ? "Actualizar" : "Crear Usuario")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 lg:pb-4">
              <CardTitle className="text-base lg:text-lg font-semibold">Total Usuarios</CardTitle>
              <Users className="h-5 w-5 lg:h-6 lg:w-6 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-2">{users.length}</div>
              <p className="text-xs lg:text-sm text-muted-foreground">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 lg:pb-4">
              <CardTitle className="text-base lg:text-lg font-semibold">Administradores</CardTitle>
              <Shield className="h-5 w-5 lg:h-6 lg:w-6 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-red-600 mb-2">{getAdminCount()}</div>
              <p className="text-xs lg:text-sm text-muted-foreground">Con permisos completos</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 lg:pb-4">
              <CardTitle className="text-base lg:text-lg font-semibold">Usuarios Activos</CardTitle>
              <UserCheck className="h-5 w-5 lg:h-6 lg:w-6 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-2">{getActiveCount()}</div>
              <p className="text-xs lg:text-sm text-muted-foreground">Cuentas habilitadas</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 lg:pb-4">
              <CardTitle className="text-base lg:text-lg font-semibold">Usuarios Inactivos</CardTitle>
              <UserX className="h-5 w-5 lg:h-6 lg:w-6 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-gray-600 mb-2">{getInactiveCount()}</div>
              <p className="text-xs lg:text-sm text-muted-foreground">Cuentas deshabilitadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4 lg:pb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">Lista de Usuarios</CardTitle>
                <CardDescription className="text-sm sm:text-base lg:text-lg mt-1">Gestiona todos los usuarios del sistema</CardDescription>
              </div>
            </div>
            
            {/* Search and Filters */}
            <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <div className="flex-1 max-w-md">
                <Label htmlFor="search" className="sr-only">Buscar usuario</Label>
                <Input
                  id="search"
                  placeholder="Nombre, Primer Apellido, Segundo Apellido"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs sm:text-sm lg:text-base h-9 sm:h-10 lg:h-12"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="filterRol" className="text-xs sm:text-sm lg:text-base whitespace-nowrap">Filtrar por rol</Label>
                  <Select value={filterRol} onValueChange={setFilterRol}>
                    <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm lg:text-base h-9 sm:h-10 lg:h-12">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs sm:text-sm lg:text-base">Todos</SelectItem>
                      {roles.map(role => (
                        <SelectItem key={role._id} value={String(role._id)} className="text-xs sm:text-sm lg:text-base">
                          {role.nombreRol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="filterEstado" className="text-xs sm:text-sm lg:text-base whitespace-nowrap">Filtrar por estado</Label>
                  <Select value={filterEstado} onValueChange={setFilterEstado}>
                    <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm lg:text-base h-9 sm:h-10 lg:h-12">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs sm:text-sm lg:text-base">Todos</SelectItem>
                      <SelectItem value="true" className="text-xs sm:text-sm lg:text-base">Activos</SelectItem>
                      <SelectItem value="false" className="text-xs sm:text-sm lg:text-base">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setFilterRol("all");
                    setFilterEstado("all");
                  }}
                  className="text-xs sm:text-sm lg:text-base h-9 sm:h-10 lg:h-12 px-3 sm:px-4"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile View - Cards */}
            <div className="lg:hidden space-y-4">
              {users
                .filter(user => {
                  const searchText = search.toLowerCase();
                  const matchesSearch =
                    (user.nombre?.toLowerCase() ?? "").includes(searchText) ||
                    (user.primerApell?.toLowerCase() ?? "").includes(searchText) ||
                    (user.segundoApell?.toLowerCase() ?? "").includes(searchText);
                  const matchesRol = filterRol === "all" ? true : String(user.idRol) === String(filterRol);
                  const matchesEstado = filterEstado === "all" ? true : String(user.estado) === filterEstado;
                  return matchesSearch && matchesRol && matchesEstado;
                })
                .map((user) => {
                  const roleName = roles.find(r => String(r._id) === String(user.idRol))?.nombreRol || "Sin rol";
                  return (
                    <Card key={user._id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-base">{user.nombre} {user.primerApell}</h3>
                          <p className="text-sm text-gray-600">{user.segundoApell || "-"}</p>
                        </div>
                        <Badge variant={user.estado ? "default" : "secondary"} className="text-xs">
                          {user.estado ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-medium">Teléfono:</span> {user.numTel}</p>
                        <p className="text-sm"><span className="font-medium">Correo:</span> {user.correo}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {roleName}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUserId(user._id)}
                                className="h-8 w-8 p-0"
                              >
                                <Key className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="mx-4">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Restablecer Contraseña</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Estás seguro de que quieres restablecer la contraseña de este usuario?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleResetPassword(user._id)}>
                                  Restablecer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="mx-4">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar Usuario</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(user._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base font-semibold">Nombre</TableHead>
                    <TableHead className="text-base font-semibold">Primer Apellido</TableHead>
                    <TableHead className="text-base font-semibold">Segundo Apellido</TableHead>
                    <TableHead className="text-base font-semibold">Teléfono</TableHead>
                    <TableHead className="text-base font-semibold">Correo</TableHead>
                    <TableHead className="text-base font-semibold">Rol</TableHead>
                    <TableHead className="text-base font-semibold">Estado</TableHead>
                    <TableHead className="text-base font-semibold text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users
                    .filter(user => {
                      const searchText = search.toLowerCase();
                      const matchesSearch =
                        (user.nombre?.toLowerCase() ?? "").includes(searchText) ||
                        (user.primerApell?.toLowerCase() ?? "").includes(searchText) ||
                        (user.segundoApell?.toLowerCase() ?? "").includes(searchText);
                      const matchesRol = filterRol === "all" ? true : String(user.idRol) === String(filterRol);
                      const matchesEstado = filterEstado === "all" ? true : String(user.estado) === filterEstado;
                      return matchesSearch && matchesRol && matchesEstado;
                    })
                    .map((user) => {
                      const roleName = roles.find(r => String(r._id) === String(user.idRol))?.nombreRol || "Sin rol";
                      return (
                        <TableRow key={user._id} className="hover:bg-gray-50">
                          <TableCell className="text-base font-medium">{user.nombre}</TableCell>
                          <TableCell className="text-base">{user.primerApell}</TableCell>
                          <TableCell className="text-base">{user.segundoApell || "-"}</TableCell>
                          <TableCell className="text-base">{user.numTel}</TableCell>
                          <TableCell className="text-base">{user.correo}</TableCell>
                          <TableCell className="text-base">
                            <Badge variant="outline" className="text-sm">
                              {roleName}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-base">
                            <Badge variant={user.estado ? "default" : "secondary"} className="text-sm">
                              {user.estado ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(user)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedUserId(user._id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Key className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="mx-4">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Restablecer Contraseña</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      ¿Estás seguro de que quieres restablecer la contraseña de este usuario?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleResetPassword(user._id)}>
                                      Restablecer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="mx-4">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Eliminar Usuario</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(user._id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
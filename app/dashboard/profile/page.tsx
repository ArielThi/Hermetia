"use client"

import type React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, ArrowLeft, CheckCircle, Eye, EyeOff, Lock, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface UserData {
  _id: number
  nombre: string
  primerApell: string
  segundoApell: string
  numTel: string
  correo: string
  idRol: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Estados para información personal (sin correo)
  const [personalInfo, setPersonalInfo] = useState({
    nombre: "",
    primerApell: "",
    segundoApell: "",
    numTel: "",
  })

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setPersonalInfo({
        nombre: parsedUser.nombre || "",
        primerApell: parsedUser.primerApell || "",
        segundoApell: parsedUser.segundoApell || "",
        numTel: parsedUser.numTel || "",
      })
    } else {
      router.push("/")
    }
  }, [router])

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await fetch(`/api/users/${user?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...personalInfo,
          updateType: "profile",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Información actualizada exitosamente")
        // Actualizar localStorage - Corregido el error de TypeScript
        if (user) {
          const updatedUser: UserData = { 
            ...user, 
            ...personalInfo 
          }
          localStorage.setItem("user", JSON.stringify(updatedUser))
          setUser(updatedUser)
        }
      } else {
        setError(data.error || "Error al actualizar la información")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validaciones
    if (passwordData.newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres")
      return
    }

    if (passwordData.newPassword === "123456789") {
      setError("No puedes usar la contraseña por defecto")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Las nuevas contraseñas no coinciden")
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setError("La nueva contraseña debe ser diferente a la actual")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?._id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          isFirstTime: false,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Contraseña cambiada exitosamente")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        setError(data.error || "Error al cambiar la contraseña")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header - Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.back()} 
              className="flex items-center gap-2 w-fit"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver</span>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Gestiona tu información personal y configuración de cuenta
              </p>
            </div>
          </div>

          {/* Alerts - Responsive */}
          {error && (
            <Alert variant="destructive" className="mb-4 sm:mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 sm:mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm">{success}</AlertDescription>
            </Alert>
          )}

          {/* Tabs - Responsive */}
          <Tabs defaultValue="personal" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger 
                value="personal" 
                className="flex items-center gap-2 py-2 px-3 text-xs sm:text-sm"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Información Personal</span>
                <span className="sm:hidden">Personal</span>
              </TabsTrigger>
              <TabsTrigger 
                value="password" 
                className="flex items-center gap-2 py-2 px-3 text-xs sm:text-sm"
              >
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Cambiar Contraseña</span>
                <span className="sm:hidden">Contraseña</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Información Personal</CardTitle>
                  <CardDescription className="text-sm">
                    Actualiza tu información personal. Estos cambios se reflejarán en todo el sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePersonalInfoSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-sm font-medium">Nombre</Label>
                        <Input
                          id="nombre"
                          value={personalInfo.nombre}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, nombre: e.target.value })}
                          placeholder="Tu nombre"
                          required
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="primerApell" className="text-sm font-medium">Primer Apellido</Label>
                        <Input
                          id="primerApell"
                          value={personalInfo.primerApell}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, primerApell: e.target.value })}
                          placeholder="Tu primer apellido"
                          required
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="segundoApell" className="text-sm font-medium">Segundo Apellido</Label>
                        <Input
                          id="segundoApell"
                          value={personalInfo.segundoApell}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, segundoApell: e.target.value })}
                          placeholder="Tu segundo apellido (opcional)"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="numTel" className="text-sm font-medium">Número de Teléfono</Label>
                        <Input
                          id="numTel"
                          value={personalInfo.numTel}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, numTel: e.target.value })}
                          placeholder="Tu número de teléfono"
                          required
                          className="w-full"
                        />
                      </div>

                      {/* Campo de correo solo lectura */}
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="correo" className="text-sm font-medium">Correo Electrónico</Label>
                        <Input
                          id="correo"
                          type="email"
                          value={user.correo}
                          disabled
                          className="w-full bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">
                          El correo electrónico no se puede modificar
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setPersonalInfo({
                            nombre: user.nombre || "",
                            primerApell: user.primerApell || "",
                            segundoApell: user.segundoApell || "",
                            numTel: user.numTel || "",
                          })
                          setError("")
                          setSuccess("")
                        }}
                        className="w-full sm:w-auto"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={loading} 
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                      >
                        {loading ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Cambiar Contraseña</CardTitle>
                  <CardDescription className="text-sm">
                    Actualiza tu contraseña para mantener tu cuenta segura. Necesitarás tu contraseña actual.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm font-medium">Contraseña Actual</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Ingresa tu contraseña actual"
                          required
                          className="w-full pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium">Nueva Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Ingresa tu nueva contraseña"
                          required
                          className="w-full pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Mínimo 8 caracteres, debe ser diferente a la actual</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Nueva Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Confirma tu nueva contraseña"
                          required
                          className="w-full pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          })
                          setError("")
                          setSuccess("")
                        }}
                        className="w-full sm:w-auto"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={loading} 
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                      >
                        {loading ? "Cambiando..." : "Cambiar Contraseña"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

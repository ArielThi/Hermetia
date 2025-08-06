"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, AlertTriangle, CheckCircle, Leaf, Shield } from "lucide-react"
import Image from "next/image"

export default function ChangePasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const userId = searchParams.get("userId")
  const isRequired = searchParams.get("required") === "true"

  useEffect(() => {
    if (!userId) {
      router.push("/")
    }
  }, [userId, router])

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres"
    }
    if (password === "123456789") {
      return "No puedes usar la contraseña por defecto"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validaciones
    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
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
          userId: Number.parseInt(userId!),
          currentPassword: "123456789", // Siempre es la contraseña por defecto en el primer cambio
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Contraseña cambiada exitosamente")
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
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

  if (!userId) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with animated gradient - Same as login */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse" />
          <div className="absolute top-32 right-20 w-16 h-16 bg-emerald-300 rounded-full opacity-30 animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-teal-200 rounded-full opacity-25 animate-pulse delay-2000" />
          <div className="absolute bottom-32 right-32 w-12 h-12 bg-green-300 rounded-full opacity-20 animate-pulse delay-500" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo and header section */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-white p-3 rounded-full shadow-lg border border-green-100">
                <Image
                  src="/Logo.svg"
                  alt="Hermetia Vitalis Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                  priority
                />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Hermetia Vitalis
          </h1>
          <p className="text-gray-600 text-base font-medium">
            Sistema de Monitoreo de Incubadoras
          </p>
          <div className="mt-3 h-1 w-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto" />
        </div>

        {/* Change password card */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl shadow-green-500/10">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Cambio de Contraseña {isRequired ? "Requerido" : ""}
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              {isRequired
                ? "Debes cambiar tu contraseña por defecto para continuar"
                : "Establece una nueva contraseña para tu cuenta"}
            </CardDescription>
            {isRequired && (
              <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-orange-600 bg-orange-50 rounded-lg p-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Este cambio es obligatorio para continuar</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password field */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                  Nueva Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingresa tu nueva contraseña"
                    className="pl-10 pr-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-colors"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Mínimo 8 caracteres, no puede ser la contraseña por defecto
                </p>
              </div>

              {/* Confirm Password field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirmar Nueva Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                    className="pl-10 pr-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-colors"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Error alert */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {/* Success alert */}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-70"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cambiando contraseña...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Cambiar Contraseña</span>
                    <Shield className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Additional info */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Leaf className="h-4 w-4 text-green-500" />
                <span>Seguridad para Hermetia illucens</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          {isRequired && (
            <p className="text-sm text-orange-600 mb-2 font-medium">
              No puedes acceder al sistema hasta cambiar tu contraseña
            </p>
          )}
          <p className="text-sm text-gray-500 mb-2">
            Sistema de Monitoreo para Incubadoras de Hermetia illucens
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span>© 2024 Hermetia Vitalis</span>
          </div>
        </div>
      </div>
    </div>
  )
}

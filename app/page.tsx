"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Leaf, AlertTriangle, Mail, Lock, ArrowRight } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Guardar información del usuario en localStorage
        localStorage.setItem("user", JSON.stringify(data.user))

        // Si requiere cambio de contraseña, redirigir a la página de cambio
        if (data.requiresPasswordChange) {
          router.push(`/change-password?userId=${data.user._id}&required=true`)
        } else {
          router.push("/dashboard")
        }
      } else {
        setError(data.error || "Error en el login")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with animated gradient */}
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
        {/* Logo and header section - Posición ajustada */}
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

        {/* Login card */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl shadow-green-500/10">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    className="pl-10 pr-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-colors"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
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

              {/* Submit button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-70"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Additional info */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Leaf className="h-4 w-4 text-green-500" />
                <span>Monitoreo inteligente para Hermetia illucens</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
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

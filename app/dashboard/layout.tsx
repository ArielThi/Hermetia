"use client"

import type React from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AlertTriangle, Home, LogOut, Menu, User, Users } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface DashboardUser {
  _id: number
  nombre: string
  primerApell: string
  correo: string
  idRol: number
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: pathname === "/dashboard",
    },
    {
      name: "Sistema de Alertas",
      href: "/dashboard/alerts",
      icon: AlertTriangle,
      current: pathname === "/dashboard/alerts",
    },
    {
      name: "Gestión de Usuarios",
      href: "/dashboard/users",
      icon: Users,
      current: pathname === "/dashboard/users",
      adminOnly: true,
    },
  ]

  const filteredNavigation = navigation.filter((item) => !item.adminOnly || user?.idRol === 1)

  // Componente de contenido de la sidebar
  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex h-full flex-col">
      {/* Header con logo */}
      <div className="flex h-16 lg:h-20 items-center border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          <div className="bg-green-100 p-2 rounded-lg flex items-center justify-center">
            <img src="/Logo.svg" alt="Logo Hermetia" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
          </div>
          <span className="text-lg lg:text-xl font-bold text-gray-900">Hermetia Vitalis</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {filteredNavigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                item.current ? "bg-green-100 text-green-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  item.current ? "text-green-500" : "text-gray-400 group-hover:text-gray-500"
                }`}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User menu */}
      <div className="border-t border-gray-200 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarFallback className="bg-green-100 text-green-600">
                  {user?.nombre.charAt(0)}
                  {user?.primerApell.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {user?.nombre} {user?.primerApell}
                </span>
                <span className="text-xs text-gray-500 truncate">{user?.correo}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white px-4 py-3 shadow-sm border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-1.5 rounded-lg">
              <img src="/Logo.svg" alt="Logo Hermetia" className="h-6 w-6 object-contain" />
            </div>
            <span className="text-lg font-bold text-gray-900">Hermetia Vitalis</span>
          </div>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-white lg:shadow-lg">
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-4 px-4 sm:px-6 lg:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

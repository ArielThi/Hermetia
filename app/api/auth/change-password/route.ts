import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { userId, currentPassword, newPassword } = await request.json()

    // Validar que se proporcionen todos los campos
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Buscar usuario
    const user = await User.findOne({ _id: userId })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar contraseña actual
    if (user.contrasena !== currentPassword) {
      return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 401 })
    }

    // Validar que la nueva contraseña no sea la misma que la actual
    if (currentPassword === newPassword) {
      return NextResponse.json({ error: "La nueva contraseña debe ser diferente a la actual" }, { status: 400 })
    }

    // Validar que la nueva contraseña no sea la por defecto
    if (newPassword === "123456789") {
      return NextResponse.json({ error: "No puedes usar la contraseña por defecto" }, { status: 400 })
    }

    // Validar longitud mínima de la nueva contraseña
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "La nueva contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    // Actualizar contraseña
    await User.findOneAndUpdate({ _id: userId }, { contrasena: newPassword })

    return NextResponse.json({ message: "Contraseña actualizada exitosamente" })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

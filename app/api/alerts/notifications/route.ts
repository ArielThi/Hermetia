import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import LogNotf from "@/models/LogNotf"
import Componentes from "@/models/Componentes"

export async function GET() {
  try {
    await connectDB()

    const notifications = await LogNotf.find({}).sort({ fechaHora: -1 }).limit(50).lean()

    // Obtener información de componentes
    const componentIds = [...new Set(notifications.map((n) => n.idComponente))]
    const componentes = await Componentes.find({ _id: { $in: componentIds } }).lean()
    const componentMap = new Map(componentes.map((c) => [c._id, c]))

    // Enriquecer notificaciones con información del componente
    const enrichedNotifications = notifications.map((notification) => ({
      ...notification,
      nombreComponente: componentMap.get(notification.idComponente)?.nombreComponente || "Componente desconocido",
      tipoComponente: componentMap.get(notification.idComponente)?.tipo || "desconocido",
    }))

    return NextResponse.json(enrichedNotifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ConfigNotf from "@/models/ConfigNotf"

export async function GET() {
  try {
    await connectDB()

    // Obtener la configuración de notificaciones (solo hay una)
    const config = await ConfigNotf.findOne({ _id: 1 }).lean()

    if (!config) {
      return NextResponse.json({ error: "No se encontró configuración" }, { status: 404 })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error al obtener configuración:", error)
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 })
  }
}

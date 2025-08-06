import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import InfoIncubadora from "@/models/InfoIncubadora"

export async function GET() {
  try {
    await connectDB()

    // Obtener la información actual de la incubadora (solo hay una)
    const infoIncubadora = await InfoIncubadora.findOne({ _id: 1 }).lean()

    if (!infoIncubadora) {
      return NextResponse.json({ error: "No se encontró información de la incubadora" }, { status: 404 })
    }

    return NextResponse.json(infoIncubadora)
  } catch (error) {
    console.error("Error al obtener datos actuales:", error)
    return NextResponse.json({ error: "Error al obtener datos actuales" }, { status: 500 })
  }
}

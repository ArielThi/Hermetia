import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ConfigNotf from "@/models/ConfigNotf"

export async function GET() {
  try {
    await connectDB()

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

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const configData = await request.json()

    const updatedConfig = await ConfigNotf.findOneAndUpdate({ _id: 1 }, configData, { new: true, upsert: true }).lean()

    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error("Error al guardar configuración:", error)
    return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 })
  }
}

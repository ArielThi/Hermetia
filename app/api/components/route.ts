import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Componentes from "@/models/Componentes"

export async function GET() {
  try {
    await connectDB()

    const componentes = await Componentes.find({}).lean()

    return NextResponse.json(componentes)
  } catch (error) {
    console.error("Error fetching components:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const { id, estado } = await request.json()

    const componente = await Componentes.findOneAndUpdate({ _id: id }, { estado }, { new: true })

    if (!componente) {
      return NextResponse.json({ error: "Componente no encontrado" }, { status: 404 })
    }

    return NextResponse.json(componente)
  } catch (error) {
    console.error("Error updating component:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

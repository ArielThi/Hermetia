import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Componentes from "@/models/Componentes"

export async function GET() {
  try {
    await connectDB()

    const componentes = await Componentes.find({}).lean()

    // Separar por tipo y crear el objeto de respuesta
    const sensores = componentes.filter((c) => c.tipo === "sensor")
    const actuadores = componentes.filter((c) => c.tipo === "actuador")

    const response = {
      // Estados de sensores
      edoDht11A: sensores.find((s) => s._id === 1)?.estado || false,
      edoDht11B: sensores.find((s) => s._id === 2)?.estado || false,

      // Estados de actuadores
      edoCalefactor: actuadores.find((a) => a._id === 5)?.estado || false,
      edoHumificador: actuadores.find((a) => a._id === 3)?.estado || false,
      edoVentilador: actuadores.find((a) => a._id === 4)?.estado || false,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching sensor status:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

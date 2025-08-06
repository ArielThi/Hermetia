import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AlerActuadores from "@/models/AlerActuadores"
import Componentes from "@/models/Componentes"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await connectDB()

    // Obtener todas las alertas de actuadores
    const alertas = await AlerActuadores.find({
      idInfoIncubadora: 1,
    })
      .sort({ fechaRegistro: -1 })
      .lean()

    // Obtener información de componentes para mapear nombres
    const componentes = await Componentes.find().lean()
    const componentesMap = new Map()
    componentes.forEach((comp) => {
      componentesMap.set(comp._id.toString(), comp.nombreComponente)
    })

    // Mapear alertas con información de componentes
    const alertasFormateadas = alertas.map((alerta) => ({
      _id: alerta._id.toString(),
      fechaRegistro: alerta.fechaRegistro,
      idActuador: alerta.idComponente,
      nombreActuador: componentesMap.get(alerta.idComponente?.toString()) || `Actuador ${alerta.idComponente}`,
      tipo: "warning",
      mensaje: `Activación del ${componentesMap.get(alerta.idComponente?.toString()) || `Actuador ${alerta.idComponente}`}`,
    }))

    return NextResponse.json(alertasFormateadas)
  } catch (error) {
    console.error("Error al obtener historial de alertas:", error)
    return NextResponse.json({ error: "Error al obtener historial de alertas" }, { status: 500 })
  }
}

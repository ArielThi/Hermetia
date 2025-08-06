import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import LogNotf from "@/models/LogNotf"
import Componentes from "@/models/Componentes"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await connectDB()

    // Obtener todas las alertas de umbrales
    const alertas = await LogNotf.find({}).sort({ fechaHora: -1 }).lean()

    // Obtener información de componentes para mapear nombres
    const componentes = await Componentes.find().lean()
    const componentesMap = new Map()
    componentes.forEach((comp) => {
      componentesMap.set(comp._id.toString(), comp.nombreComponente)
    })

    // Mapear alertas con información de componentes
    const alertasFormateadas = alertas.map((alerta) => ({
      _id: alerta._id.toString(),
      fechaRegistro: alerta.fechaHora,
      tipo: alerta.tipo,
      valor: alerta.valor,
      umbral: alerta.umbral,
      condicion: alerta.condicion,
      idComponente: alerta.idComponente,
      nombreComponente: componentesMap.get(alerta.idComponente?.toString()) || `Componente ${alerta.idComponente}`,
      mensaje: `${alerta.tipo === "temperatura" ? "Temperatura" : "Humedad"} ${alerta.condicion} al umbral: ${alerta.valor}${alerta.tipo === "temperatura" ? "°C" : "%"} (límite: ${alerta.umbral}${alerta.tipo === "temperatura" ? "°C" : "%"})`,
    }))

    return NextResponse.json(alertasFormateadas)
  } catch (error) {
    console.error("Error al obtener alertas de umbrales:", error)
    return NextResponse.json({ error: "Error al obtener alertas de umbrales" }, { status: 500 })
  }
}

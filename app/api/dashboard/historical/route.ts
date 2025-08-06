import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import HistorialTemp from "@/models/HistorialTemp"
import HistorialHum from "@/models/HistorialHum"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "24h"

    // Calcular fecha de inicio basada en el rango
    const now = new Date()
    const startDate = new Date()

    switch (range) {
      case "24h":
        startDate.setHours(now.getHours() - 24)
        break
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      default:
        startDate.setHours(now.getHours() - 24)
    }

    console.log(`Buscando datos desde: ${startDate.toISOString()} hasta: ${now.toISOString()}`)

    // Obtener datos de temperatura y humedad
    const [tempData, humData] = await Promise.all([
      HistorialTemp.find({
        fechaRegistro: { $gte: startDate, $lte: now },
      })
        .sort({ fechaRegistro: 1 })
        .lean(),

      HistorialHum.find({
        fechaRegistro: { $gte: startDate, $lte: now },
      })
        .sort({ fechaRegistro: 1 })
        .lean(),
    ])

    console.log(`Datos encontrados - Temperatura: ${tempData.length}, Humedad: ${humData.length}`)

    // Función para obtener la hora exacta (TODOS los rangos usan promedio por hora)
    const getHourKey = (date: Date) => {
      const d = new Date(date)
      d.setMinutes(0, 0, 0) // Resetear minutos, segundos y milisegundos
      return d.toISOString()
    }

    // Agrupar datos por hora para TODOS los rangos
    const hourlyData = new Map()

    // Procesar datos de temperatura
    tempData.forEach((item) => {
      const hourKey = getHourKey(new Date(item.fechaRegistro))
      if (!hourlyData.has(hourKey)) {
        hourlyData.set(hourKey, {
          timestamp: hourKey,
          temperaturas: [],
          humedades: [],
        })
      }
      hourlyData.get(hourKey).temperaturas.push(item.temperatura)
    })

    // Procesar datos de humedad
    humData.forEach((item) => {
      const hourKey = getHourKey(new Date(item.fechaRegistro))
      if (!hourlyData.has(hourKey)) {
        hourlyData.set(hourKey, {
          timestamp: hourKey,
          temperaturas: [],
          humedades: [],
        })
      }
      hourlyData.get(hourKey).humedades.push(item.humedad)
    })

    // Convertir a array y calcular promedios por hora
    const result = Array.from(hourlyData.entries())
      .map(([hourKey, data]) => {
        // Calcular promedio de temperatura (de todos los componentes)
        const avgTemp = data.temperaturas.length > 0 
          ? data.temperaturas.reduce((a: number, b: number) => a + b, 0) / data.temperaturas.length 
          : 0
        
        // Calcular promedio de humedad (de todos los componentes)
        const avgHum = data.humedades.length > 0 
          ? data.humedades.reduce((a: number, b: number) => a + b, 0) / data.humedades.length 
          : 0

        const date = new Date(hourKey)
        
        // Formatear la hora según el rango (mejorado)
        let timeFormat: string
        if (range === "24h") {
          timeFormat = date.toLocaleTimeString("es-ES", { 
            hour: "2-digit", 
            minute: "2-digit" 
          })
        } else if (range === "7d") {
          timeFormat = date.toLocaleDateString("es-ES", { 
            day: "2-digit", 
            month: "2-digit"
          }) + " " + date.toLocaleTimeString("es-ES", { 
            hour: "2-digit"
          }) + "h"
        } else { // 30d
          timeFormat = date.toLocaleDateString("es-ES", { 
            day: "2-digit", 
            month: "2-digit"
          }) + " " + date.toLocaleTimeString("es-ES", { 
            hour: "2-digit"
          }) + "h"
        }

        return {
          time: timeFormat,
          temperatura: Number(avgTemp.toFixed(2)),
          humedad: Number(avgHum.toFixed(2)),
          timestamp: hourKey,
          // Información adicional para debugging
          tempCount: data.temperaturas.length,
          humCount: data.humedades.length
        }
      })
      .filter(item => item.temperatura > 0 || item.humedad > 0) // Solo incluir si hay datos
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Ordenar cronológicamente

    console.log(`Datos procesados: ${result.length} registros por hora`)
    console.log(`Ejemplo de datos:`, result.slice(0, 3))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error al obtener datos históricos:", error)
    return NextResponse.json({ error: "Error al obtener datos históricos" }, { status: 500 })
  }
}

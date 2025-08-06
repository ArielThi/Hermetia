import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import HistorialTemp from "@/models/HistorialTemp"
import HistorialHum from "@/models/HistorialHum"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "24h"
    const format = searchParams.get("format") || "json"

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

    // Obtener datos de temperatura y humedad
    const [tempData, humData] = await Promise.all([
      HistorialTemp.find({
        fechaRegistro: { $gte: startDate },
        idInfoIncubadora: 1,
      })
        .sort({ fechaRegistro: 1 })
        .lean(),
      HistorialHum.find({
        fechaRegistro: { $gte: startDate },
        idInfoIncubadora: 1,
      })
        .sort({ fechaRegistro: 1 })
        .lean(),
    ])

    // Combinar datos por timestamp
    const dataMap = new Map()

    tempData.forEach((temp) => {
      const timestamp = temp.fechaRegistro.toISOString()
      if (!dataMap.has(timestamp)) {
        dataMap.set(timestamp, {
          timestamp: temp.fechaRegistro,
          time: temp.fechaRegistro.toLocaleString("es-ES"),
          temperatura: 0,
          humedad: 0,
          tempCount: 0,
          humCount: 0,
        })
      }
      const entry = dataMap.get(timestamp)
      entry.temperatura += temp.temperatura
      entry.tempCount += 1
    })

    humData.forEach((hum) => {
      const timestamp = hum.fechaRegistro.toISOString()
      if (!dataMap.has(timestamp)) {
        dataMap.set(timestamp, {
          timestamp: hum.fechaRegistro,
          time: hum.fechaRegistro.toLocaleString("es-ES"),
          temperatura: 0,
          humedad: 0,
          tempCount: 0,
          humCount: 0,
        })
      }
      const entry = dataMap.get(timestamp)
      entry.humedad += hum.humedad
      entry.humCount += 1
    })

    // Calcular promedios y formatear datos
    const combinedData = Array.from(dataMap.values())
      .map((entry) => ({
        timestamp: entry.timestamp,
        time: entry.time,
        temperatura: entry.tempCount > 0 ? Number((entry.temperatura / entry.tempCount).toFixed(2)) : 0,
        humedad: entry.humCount > 0 ? Number((entry.humedad / entry.humCount).toFixed(2)) : 0,
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    // Generar respuesta según el formato
    if (format === "csv") {
      const csvHeader = "Fecha,Hora,Temperatura (°C),Humedad (%)\n"
      const csvData = combinedData
        .map((row) => {
          const date = new Date(row.timestamp)
          return `${date.toLocaleDateString("es-ES")},${date.toLocaleTimeString("es-ES")},${row.temperatura},${row.humedad}`
        })
        .join("\n")

      return new NextResponse(csvHeader + csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="datos_hermetia_${range}.csv"`,
        },
      })
    } else {
      // JSON format
      return NextResponse.json(combinedData, {
        headers: {
          "Content-Disposition": `attachment; filename="datos_hermetia_${range}.json"`,
        },
      })
    }
  } catch (error) {
    console.error("Error al exportar datos:", error)
    return NextResponse.json({ error: "Error al exportar datos" }, { status: 500 })
  }
}

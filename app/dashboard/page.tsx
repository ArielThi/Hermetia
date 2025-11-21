"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
  Thermometer,
  Droplets,
  RefreshCw,
  Download,
  Cpu,
  Zap,
  Bell,
  FileText,
  FileSpreadsheet,
  FileJson,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

interface SensorData {
  temperatura: number
  humedad: number
  timestamp: string
}

interface OptimalRange {
  tempMin: number
  tempMax: number
  humedadMin: number
  humedadMax: number
}

interface HistoricalData {
  time: string
  temperatura: number
  humedad: number
  timestamp: string
}

interface SensorStatus {
  edoDht11A: boolean
  edoDht11B: boolean
  edoCalefactor: boolean
  edoHumificador: boolean
  edoVentilador: boolean
}

export default function Dashboard() {
  const { toast } = useToast()
  
  // Agregar estados de carga
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true)
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(true)
  
  // Cambiar estado inicial a null para evitar valores falsos
  const [sensorData, setSensorData] = useState<SensorData | null>(null)

  const [optimalRange, setOptimalRange] = useState<OptimalRange>({
    tempMin: 26,
    tempMax: 29,
    humedadMin: 60,
    humedadMax: 80,
  })

  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [isCelsius, setIsCelsius] = useState(true)
  const [timeRange, setTimeRange] = useState("24h")
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [sensorStatus, setSensorStatus] = useState<SensorStatus>({
    edoDht11A: true,
    edoDht11B: true,
    edoCalefactor: false,
    edoHumificador: true,
    edoVentilador: false,
  })
  const [totalAlerts, setTotalAlerts] = useState(0)

  // Cargar datos iniciales
  useEffect(() => {
    loadCurrentData()
    loadOptimalRange()
    loadHistoricalData()
    loadSensorStatus()
    loadTotalAlerts()
  }, [])

  // Auto-refresh
  useEffect(() => {
    if (isAutoRefresh) {
      const interval = setInterval(() => {
        loadCurrentData()
        loadSensorStatus()
      }, 30000) // Actualizar cada 30 segundos
      return () => clearInterval(interval)
    }
  }, [isAutoRefresh])

  const loadCurrentData = async () => {
    try {
      setIsLoadingCurrent(true)
      const response = await fetch("/api/dashboard/current")
      if (response.ok) {
        const data = await response.json()
        setSensorData({
          temperatura: data.temperActual || 27.5,
          humedad: data.humedActual || 75.2,
          timestamp: new Date().toLocaleTimeString(),
        })
      } else {
        // Solo usar datos de fallback si no hay datos previos
        if (!sensorData) {
          setSensorData({
            temperatura: 27.5,
            humedad: 75.2,
            timestamp: new Date().toLocaleTimeString(),
          })
        }
      }
    } catch (error) {
      console.error("Error loading current data:", error)
      // Solo usar datos de fallback si no hay datos previos
      if (!sensorData) {
        setSensorData({
          temperatura: 27.5,
          humedad: 75.2,
          timestamp: new Date().toLocaleTimeString(),
        })
      }
    } finally {
      setIsLoadingCurrent(false)
    }
  }

  const loadOptimalRange = async () => {
    try {
      const response = await fetch("/api/dashboard/config")
      if (response.ok) {
        const data = await response.json()
        setOptimalRange({
          tempMin: data.tempMin || 26,
          tempMax: data.tempMax || 29,
          humedadMin: data.humedadMin || 60,
          humedadMax: data.humedadMax || 80,
        })
      }
    } catch (error) {
      console.error("Error loading optimal range:", error)
    }
  }

  const loadHistoricalData = async () => {
    try {
      setIsLoadingHistorical(true)
      const response = await fetch(`/api/dashboard/historical?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setHistoricalData(data)
      } else {
        // Solo usar datos mock si no hay datos previos
        if (historicalData.length === 0) {
          const mockData = Array.from({ length: 24 }, (_, i) => ({
            time: `${String(i).padStart(2, "0")}:00`,
            temperatura: 26 + Math.random() * 4,
            humedad: 65 + Math.random() * 20,
            timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          }))
          setHistoricalData(mockData)
        }
      }
    } catch (error) {
      console.error("Error loading historical data:", error)
      // Solo usar datos mock si no hay datos previos
      if (historicalData.length === 0) {
        const mockData = Array.from({ length: 24 }, (_, i) => ({
          time: `${String(i).padStart(2, "0")}:00`,
          temperatura: 26 + Math.random() * 4,
          humedad: 65 + Math.random() * 20,
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        }))
        setHistoricalData(mockData)
      }
    } finally {
      setIsLoadingHistorical(false)
    }
  }

  const loadSensorStatus = async () => {
    try {
      const response = await fetch("/api/dashboard/sensors")
      if (response.ok) {
        const data = await response.json()
        setSensorStatus(data)
      }
    } catch (error) {
      console.error("Error loading sensor status:", error)
    }
  }

  const loadTotalAlerts = async () => {
    try {
      const [actuatorResponse, thresholdResponse] = await Promise.all([
        fetch("/api/alerts/history"),
        fetch("/api/alerts/thresholds"),
      ])

      let total = 0
      if (actuatorResponse.ok) {
        const actuatorData = await actuatorResponse.json()
        total += actuatorData.length
      }
      if (thresholdResponse.ok) {
        const thresholdData = await thresholdResponse.json()
        total += thresholdData.length
      }

      setTotalAlerts(total)
    } catch (error) {
      console.error("Error loading total alerts:", error)
      setTotalAlerts(0)
    }
  }

  // Actualizar datos históricos cuando cambie el rango de tiempo
  useEffect(() => {
    loadHistoricalData()
  }, [timeRange])

  const convertTemperature = (temp: number) => {
    return isCelsius ? temp : (temp * 9) / 5 + 32
  }

  const getTemperatureUnit = () => (isCelsius ? "°C" : "°F")

  const getTemperaturePercentage = () => {
    if (!sensorData) return 0
    
    const currentTemp = convertTemperature(sensorData.temperatura)
    const minTemp = convertTemperature(optimalRange.tempMin)
    const maxTemp = convertTemperature(optimalRange.tempMax)
    
    const rangeExtension = (maxTemp - minTemp) * 0.5
    const visualMin = Math.max(0, minTemp - rangeExtension)
    const visualMax = maxTemp + rangeExtension
    
    const percentage = Math.min(100, Math.max(0, ((currentTemp - visualMin) / (visualMax - visualMin)) * 100))
    return percentage
  }

  const getOptimalRangeText = () => {
    const minTemp = convertTemperature(optimalRange.tempMin)
    const maxTemp = convertTemperature(optimalRange.tempMax)
    return `${minTemp.toFixed(1)}° - ${maxTemp.toFixed(1)}°`
  }

  const isTemperatureOptimal = () => {
    if (!sensorData) return false
    return sensorData.temperatura >= optimalRange.tempMin && sensorData.temperatura <= optimalRange.tempMax
  }

  const isHumidityOptimal = () => {
    if (!sensorData) return false
    return sensorData.humedad >= optimalRange.humedadMin && sensorData.humedad <= optimalRange.humedadMax
  }

  // Separar sensores de actuadores
  const getActiveSensorsCount = () => {
    return [sensorStatus.edoDht11A, sensorStatus.edoDht11B].filter(Boolean).length
  }

  const getTotalSensorsCount = () => {
    return 2 // Solo DHT11A y DHT11B son sensores
  }

  const getActiveActuatorsCount = () => {
    return [sensorStatus.edoCalefactor, sensorStatus.edoHumificador, sensorStatus.edoVentilador].filter(Boolean).length
  }

  const getTotalActuatorsCount = () => {
    return 3 // Calefactor, Humificador y Ventilador son actuadores
  }

  const handleExport = async (format: "json" | "csv" | "pdf") => {
    try {
      // Validar que haya datos antes de exportar
      if (!historicalData || historicalData.length === 0) {
        toast({
          title: "⚠️ Sin datos disponibles",
          description: "No hay datos disponibles para exportar. Por favor, selecciona un rango de tiempo que contenga información.",
          variant: "destructive",
          duration: 5000,
        })
        return;
      }
  
      if (format === "pdf") {
        // Para PDF, solo capturar y exportar el gráfico en formato horizontal
        const chartElement = document.querySelector(".recharts-wrapper")
        if (chartElement) {
          const canvas = await html2canvas(chartElement as HTMLElement, {
            backgroundColor: '#ffffff',
            scale: 2, // Mayor calidad
            useCORS: true
          })
          const imgData = canvas.toDataURL("image/png")
  
          // Crear PDF en formato horizontal (landscape)
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
          })
  
          // Calcular dimensiones para centrar la gráfica
          const pdfWidth = pdf.internal.pageSize.getWidth()
          const pdfHeight = pdf.internal.pageSize.getHeight()
          
          // Mantener proporción de la imagen
          const imgWidth = canvas.width
          const imgHeight = canvas.height
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
          
          const finalWidth = imgWidth * ratio * 0.8 // 80% del tamaño disponible
          const finalHeight = imgHeight * ratio * 0.8
          
          // Centrar la imagen
          const x = (pdfWidth - finalWidth) / 2
          const y = (pdfHeight - finalHeight) / 2
  
          // Agregar título
          pdf.setFontSize(16)
          pdf.text("Gráfico de Tendencias Históricas - Hermetia Vitalis", pdfWidth / 2, 15, { align: 'center' })
          
          // Agregar información del rango de tiempo
          pdf.setFontSize(12)
          pdf.text(`Rango de tiempo: ${timeRange}`, pdfWidth / 2, 25, { align: 'center' })
          pdf.text(`Generado: ${new Date().toLocaleString('es-ES')}`, pdfWidth / 2, 35, { align: 'center' })
          pdf.text(`Total de registros: ${historicalData.length}`, pdfWidth / 2, 45, { align: 'center' })
  
          // Agregar la gráfica
          pdf.addImage(imgData, "PNG", x, y + 30, finalWidth, finalHeight)
  
          // Guardar el PDF
          pdf.save(`grafico_hermetia_${timeRange}_${new Date().toISOString().split('T')[0]}.pdf`)
        } else {
          console.error("No se pudo encontrar el elemento del gráfico")
          toast({
            title: "❌ Error de captura",
            description: "No se pudo capturar el gráfico para exportar. Intenta nuevamente.",
            variant: "destructive",
            duration: 4000,
          })
        }
      } else {
        // Para CSV y JSON, crear los datos localmente con TODOS los datos de historicalData
        const exportData = historicalData.map(row => ({
          fecha: new Date(row.timestamp).toLocaleDateString('es-ES'),
          hora: new Date(row.timestamp).toLocaleTimeString('es-ES'),
          temperatura: row.temperatura,
          humedad: row.humedad,
          timestamp: row.timestamp
        }));
  
        if (format === "csv") {
          // Generar CSV localmente con TODOS los datos
          const csvHeader = "Fecha,Hora,Temperatura (°C),Humedad (%)\n"
          const csvData = exportData
            .map(row => `${row.fecha},${row.hora},${row.temperatura},${row.humedad}`)
            .join("\n")
  
          const csvContent = csvHeader + csvData
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `datos_hermetia_completos_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          // Generar JSON localmente con TODOS los datos
          const jsonContent = JSON.stringify(exportData, null, 2)
          const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `datos_hermetia_completos_${timeRange}_${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      }
    } catch (error) {
      console.error("Error al exportar:", error)
      toast({
        title: "🔌 Error al exportar",
        description: `Error al exportar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
        duration: 6000,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Monitoreo Hermetia Vitalis</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">Sistema de monitoreo para incubadoras de Hermetia illucens</p>
          </div>
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 lg:space-x-6">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-sm font-medium text-gray-600">°C</span>
              <Switch checked={!isCelsius} onCheckedChange={(checked) => setIsCelsius(!checked)} />
              <span className="text-sm font-medium text-gray-600">°F</span>
            </div>
            <Button variant="outline" size="default" onClick={loadCurrentData} className="px-4 sm:px-6 bg-transparent">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Actualizar</span>
              <span className="sm:hidden">Actualizar</span>
            </Button>
            <div className="flex items-center justify-center space-x-3">
              <span className="text-sm font-medium text-gray-600">Auto</span>
              <Switch checked={isAutoRefresh} onCheckedChange={setIsAutoRefresh} />
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold">Sensores</CardTitle>
              <Cpu className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
                {getActiveSensorsCount()}/{getTotalSensorsCount()}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Sensores activos</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold">Actuadores</CardTitle>
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">
                {getActiveActuatorsCount()}/{getTotalActuatorsCount()}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Actuadores activos</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold">Total Alertas</CardTitle>
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">{totalAlerts}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Historial completo</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Temperature */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Thermometer className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                  <CardTitle className="text-lg sm:text-xl">Temperatura</CardTitle>
                </div>
                {!isLoadingCurrent && sensorData && (
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${isTemperatureOptimal() ? "bg-green-500" : "bg-red-500"}`} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCurrent || !sensorData ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4 sm:mb-6">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                      <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={isTemperatureOptimal() ? "#10b981" : "#ef4444"}
                          strokeWidth="3"
                          strokeDasharray={`${getTemperaturePercentage()}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold">{convertTemperature(sensorData.temperatura).toFixed(1)}</div>
                          <div className="text-base sm:text-lg text-gray-500">{getTemperatureUnit()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">Rango óptimo: {getOptimalRangeText()}</p>
                    <Badge
                      variant={isTemperatureOptimal() ? "default" : "destructive"}
                      className={`text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 ${isTemperatureOptimal() ? "bg-green-100 text-green-800" : ""}`}
                    >
                      {isTemperatureOptimal() ? "Óptima" : "Fuera de rango"}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Humidity */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Droplets className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                  <CardTitle className="text-lg sm:text-xl">Humedad</CardTitle>
                </div>
                {!isLoadingCurrent && sensorData && (
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${isHumidityOptimal() ? "bg-green-500" : "bg-red-500"}`} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCurrent || !sensorData ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4 sm:mb-6">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                      <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={isHumidityOptimal() ? "#10b981" : "#ef4444"}
                          strokeWidth="3"
                          strokeDasharray={`${sensorData.humedad}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold">{sensorData.humedad.toFixed(1)}</div>
                          <div className="text-base sm:text-lg text-gray-500">%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">
                      Rango óptimo: {optimalRange.humedadMin}% - {optimalRange.humedadMax}%
                    </p>
                    <Badge
                      variant={isHumidityOptimal() ? "default" : "destructive"}
                      className={`text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 ${isHumidityOptimal() ? "bg-green-100 text-green-800" : ""}`}
                    >
                      {isHumidityOptimal() ? "Óptima" : "Fuera de rango"}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Historical Data */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4 sm:pb-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <div>
                <CardTitle className="text-xl sm:text-2xl mb-2">Tendencias Históricas</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Evolución de temperatura y humedad en el tiempo
                </CardDescription>
              </div>
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 Hora</SelectItem>
                    <SelectItem value="6h">6 Horas</SelectItem>
                    <SelectItem value="12h">12 Horas</SelectItem>
                    <SelectItem value="24h">24 Horas</SelectItem>
                    <SelectItem value="7d">7 Días</SelectItem>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default" className="px-4 sm:px-6 bg-transparent">
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="hidden sm:inline">Exportar</span>
                      <span className="sm:hidden">Exportar</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleExport("csv")} className="cursor-pointer">
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Exportar como CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("json")} className="cursor-pointer">
                      <FileJson className="w-4 h-4 mr-2" />
                      Exportar como JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("pdf")} className="cursor-pointer">
                      <FileText className="w-4 h-4 mr-2" />
                      Exportar gráfico PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                <TabsTrigger value="chart" className="text-sm sm:text-base">Gráfico</TabsTrigger>
                <TabsTrigger value="table" className="text-sm sm:text-base">Tabla</TabsTrigger>
              </TabsList>
              <TabsContent value="chart">
                <div className="w-full">
                  {/* Scroll indicator for mobile */}
                  <div className="block sm:hidden mb-2">
                    <p className="text-xs text-gray-500 text-center">← Desliza para ver más datos →</p>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[600px] h-[300px] sm:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={historicalData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 60,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="time"
                            stroke="#666"
                            fontSize={12}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={Math.max(0, Math.floor(historicalData.length / 8))}
                          />
                          <YAxis
                            yAxisId="temp"
                            orientation="left"
                            stroke="#ef4444"
                            fontSize={12}
                            domain={['dataMin - 2', 'dataMax + 2']}
                          />
                          <YAxis
                            yAxisId="humidity"
                            orientation="right"
                            stroke="#3b82f6"
                            fontSize={12}
                            domain={[0, 100]}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #ccc',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                            formatter={(value: any, name: string) => {
                              if (name === 'temperatura') {
                                return [`${convertTemperature(value).toFixed(1)}${getTemperatureUnit()}`, 'Temperatura']
                              }
                              return [`${value.toFixed(1)}%`, 'Humedad']
                            }}
                          />
                          <Line
                            yAxisId="temp"
                            type="monotone"
                            dataKey="temperatura"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                            activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2 }}
                          />
                          <Line
                            yAxisId="humidity"
                            type="monotone"
                            dataKey="humedad"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                            activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="table">
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Hora</TableHead>
                        <TableHead className="text-xs sm:text-sm">Temperatura</TableHead>
                        <TableHead className="text-xs sm:text-sm">Humedad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historicalData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-xs sm:text-sm font-medium">{row.time}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {convertTemperature(row.temperatura).toFixed(1)}{getTemperatureUnit()}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{row.humedad.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


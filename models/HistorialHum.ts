import mongoose from "mongoose"

const HistorialHumSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    fechaRegistro: {
      type: Date,
      required: true,
    },
    humedad: {
      type: Number,
      required: true,
    },
    idComponente: {
      type: Number,
      required: true,
      ref: "Componentes",
    },
  },
  {
    _id: true,
  },
)

export default mongoose.models.HistorialHum || mongoose.model("HistorialHum", HistorialHumSchema, "HISTORIALHUM")

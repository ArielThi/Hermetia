import mongoose from "mongoose"

const HistorialTempSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    fechaRegistro: {
      type: Date,
      required: true,
    },
    temperatura: {
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

export default mongoose.models.HistorialTemp || mongoose.model("HistorialTemp", HistorialTempSchema, "HISTORIALTEMP")

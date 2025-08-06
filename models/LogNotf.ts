import mongoose from "mongoose"

const LogNotfSchema = new mongoose.Schema({
  fechaHora: {
    type: Date,
    default: Date.now,
  },
  tipo: {
    type: String,
    required: true,
    enum: ["temperatura", "humedad"],
  },
  valor: {
    type: Number,
    required: true,
  },
  umbral: {
    type: Number,
    required: true,
  },
  condicion: {
    type: String,
    required: true,
    enum: ["mayor", "menor"],
  },
  idComponente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Componentes",
    required: true,
  },
  idInfoIncubadora: {
    type: Number,
    default: 1,
  },
})

export default mongoose.models.LogNotf || mongoose.model("LogNotf", LogNotfSchema)

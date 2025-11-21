import mongoose from "mongoose"

const LogNotfSchema = new mongoose.Schema({
  fechaHora: {
    type: Date,
    required: true,
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
    type: Number, // ✅ Es int según el schema
    required: true,
  },
  idInfoIncubadora: {
    type: Number,
    required: false, // Campo opcional
  },
}, {
  collection: 'LOGNOTF' // ✅ Especificar nombre de colección explícitamente
})

export default mongoose.models.LogNotf || mongoose.model("LogNotf", LogNotfSchema)

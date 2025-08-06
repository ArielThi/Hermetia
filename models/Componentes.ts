import mongoose from "mongoose"

const ComponentesSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    nombreComponente: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      required: true,
      enum: ["sensor", "actuador"],
    },
    estado: {
      type: Boolean,
      required: true,
    },
  },
  {
    _id: false,
  },
)

export default mongoose.models.Componentes || mongoose.model("Componentes", ComponentesSchema, "COMPONENTES")

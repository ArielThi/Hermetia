import mongoose from "mongoose"

const AlerActuadoresSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    fechaRegistro: {
      type: Date,
      required: true,
    },
    idComponente: {
      type: Number,
      required: true,
      ref: "Componentes",
    },
    idInfoIncubadora: {
      type: Number,
      required: true,
      ref: "InfoIncubadora",
    },
  },
  {
    _id: false,
  },
)

export default mongoose.models.AlerActuadores ||
  mongoose.model("AlerActuadores", AlerActuadoresSchema, "ALERACTUADORES")

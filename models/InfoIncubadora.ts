import mongoose from "mongoose"

const InfoIncubadoraSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    temperActual: {
      type: Number,
      required: true,
    },
    humedActual: {
      type: Number,
      required: true,
    },
    sensores: {
      type: [Number],
      required: true,
      ref: "Componentes",
    },
    actuadores: {
      type: [Number],
      required: true,
      ref: "Componentes",
    },
  },
  {
    _id: false,
  },
)

export default mongoose.models.InfoIncubadora ||
  mongoose.model("InfoIncubadora", InfoIncubadoraSchema, "INFOINCUBADORA")

import mongoose from "mongoose"

const IncubadoraSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    nombre: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
)

export default mongoose.models.Incubadora || mongoose.model("Incubadora", IncubadoraSchema, "INCUBADORA")

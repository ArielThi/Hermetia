import mongoose from "mongoose"

const EventoIncubaSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    fechaDeIngreso: {
      type: Date,
      required: true,
    },
    fechaEclosion: {
      type: Date,
      required: true,
    },
    fechaEstimada: {
      type: Date,
      required: true,
    },
    idIncubadora: {
      type: Number,
      required: true,
      ref: "Incubadora",
    },
  },
  {
    _id: false,
  },
)

export default mongoose.models.EventoIncuba || mongoose.model("EventoIncuba", EventoIncubaSchema, "EVENTOINCUBA")

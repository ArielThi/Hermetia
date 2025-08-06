import mongoose from "mongoose"

const ConfigNotfSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    humedadMax: {
      type: Number,
      required: true,
    },
    humedadMin: {
      type: Number,
      required: true,
    },
    idInfoIncubadora: {
      type: Number,
      required: true,
      ref: "InfoIncubadora",
    },
    tempMax: {
      type: Number,
      required: true,
    },
    tempMin: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
)

export default mongoose.models.ConfigNotf || mongoose.model("ConfigNotf", ConfigNotfSchema, "CONFIGNOTF")

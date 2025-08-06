import mongoose from "mongoose"

const RoleSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    nombreRol: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
)

export default mongoose.models.Role || mongoose.model("Role", RoleSchema, "ROLES")

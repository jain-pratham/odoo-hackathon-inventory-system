import mongoose from "mongoose"

const WarehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    address: String
  },
  { timestamps: true }
)

export default mongoose.models.Warehouse || mongoose.model("Warehouse", WarehouseSchema)
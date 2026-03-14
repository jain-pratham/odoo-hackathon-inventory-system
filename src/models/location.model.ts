import mongoose from "mongoose"

const LocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse"
    }
  },
  { timestamps: true }
)

export default mongoose.models.Location || mongoose.model("Location", LocationSchema)
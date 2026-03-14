import mongoose from "mongoose"

const StockSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location"
    },
    quantity: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

export default mongoose.models.Stock || mongoose.model("Stock", StockSchema)
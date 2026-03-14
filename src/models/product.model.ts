import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      required: true,
      unique: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    unit: {
      type: String
    },
    reorderLevel: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

export default mongoose.models.Product || mongoose.model("Product", ProductSchema)
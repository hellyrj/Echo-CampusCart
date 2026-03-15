import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    price: {
      type: Number
    },

    stock: {
      type: Number,
      default: 0
    },

    attributes: {
      type: Map,
      of: String
    }
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String
    },

    basePrice: {
      type: Number,
      required: true
    },

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
      }
    ],

    images: [String],

    variants: [variantSchema],

      views: {
    type: Number,
    default: 0
  },

  purchases: {
    type: Number,
    default: 0
  },

  averageRating: {
  type: Number,
  default: 0
},

reviewCount: {
  type: Number,
  default: 0
},

    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);
 
 productSchema.index({
  name: "text",
  description: "text"
 });
const Product = mongoose.model("Product", productSchema);

export default Product;
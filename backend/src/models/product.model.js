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

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ""
  },
  isMain: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: true });

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
      trim: true,
      maxlength: 200
    },

    description: {
      type: String,
      maxlength: 2000
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0
    },

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
      }
    ],

    images: [imageSchema],

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
      default: 0,
      min: 0,
      max: 5
    },

    reviewCount: {
      type: Number,
      default: 0
    },

    isAvailable: {
      type: Boolean,
      default: true
    },

    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number
    },

    inventory: {
      totalStock: {
        type: Number,
        default: 0
      },
      lowStockThreshold: {
        type: Number,
        default: 5
      },
      trackInventory: {
        type: Boolean,
        default: true
      }
    },

    slug: {
      type: String,
      unique: true,
      sparse: true
    },

    tags: [String],

    discount: {
      percentage: {
        type: Number,
        min: 0,
        max: 100
      },
      validUntil: Date,
      isActive: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true
  }
);
 
productSchema.index({
  name: "text",
  description: "text",
  tags: "text"
});

productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  //next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
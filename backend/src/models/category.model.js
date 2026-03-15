import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    slug: {
      type: String,
      unique: true
    },

    description: {
      type: String,
      trim: true,
      maxlength: 200
    },

    icon: {
      type: String,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

/*
Generate slug automatically from name
*/

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }

 // next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
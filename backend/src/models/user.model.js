import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ["student" , "vendor" , "admin"],
        default: "student",
    },

    univesity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "university",
        required: true,
    },
    profilePicture: {
        type: String,
    },

},
 { timestamps: true}
);

export default mongoose.model("User" , userSchema)
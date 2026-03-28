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

    university: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "University",
        required: false // Make optional for existing users
    },

    profilePicture: {
        type: String,
    },

},
 { timestamps: true}
);

export default mongoose.model("User" , userSchema)
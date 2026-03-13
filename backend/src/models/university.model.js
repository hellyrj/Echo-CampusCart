import mongoose from "mongoose";

const universitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },

    city: {
        type: String,
    },

    location: {
        latitude: Number,
        longtude: Number,
    }
},
   { Timestamps: true}
);

export default mongoose.model("University" , universitySchema);
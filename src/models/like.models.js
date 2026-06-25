import mongoose, { Schema } from "mongoose";

const likeSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        unique : true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        unique : true
    }
},
    { timestamps: true }
)

export const Like = mongoose.model("Like" , likeSchema)
import mongoose, { Schema } from "mongoose";
import mongooseaggregatePaginate from "mongoose-aggregate-paginate-v2"

const commentSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    content: {
        type: String,
        trim: true,
        required: true
    },
},
    {
        timestamps: true
    }
)
commentSchema.plugin(mongooseaggregatePaginate)

export const Comment = mongoose.model("Comment", commentSchema)
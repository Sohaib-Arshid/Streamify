import mongoose, { Schema } from "mongoose";
import mongooseaggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = mongoose.Schema({
    videoFile: {
        type: String,
        required : true
    },
    thumbnail: {
        type: String,
        required : true
    },
    owner: {    
        type: Schema.Types.ObjectId,
        ref: "User",
        required : true
    },
    title: {
        type: String,
        trim: true,
        required : true
    },
    description: {
        type: String,
        trim: true,
        required : true
    },
    duration: {
        type: Number,
        required : true
    },
    views: {
        type: Number,
        default : 0,
    },
    isPublished : {
        type : Boolean,
        default : true
    }
},
{
    timestamps : true
})

videoSchema.plugin(mongooseaggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)
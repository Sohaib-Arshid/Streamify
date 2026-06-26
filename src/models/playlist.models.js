import mongoose, { model, Schema } from "mongoose";

const playlistSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    name: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    description: {
        type: String,
        trim: true,
        index: true,
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        default : []
    },
    isPublic : {
        type : Boolean,
        default : true,
        required : true
    }

},
    {
        timestamps: true
    }
)

const Playlist = mongoose.model("Playlist" , playlistSchema)
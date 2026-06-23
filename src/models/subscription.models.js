import mongoose, { Schema } from "mongoose";
const subscriptionSchema = Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},
    { timestamps: true }, { unique: true }
)

export const Subscription = mongoose.model("Subscription", subscriptionSchema)
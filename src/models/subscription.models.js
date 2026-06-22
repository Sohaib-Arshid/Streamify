import mongoose, { Schema } from "mongoose";
import { User } from "./user.models";

const subscriptionSchema = Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channal: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},
    { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)
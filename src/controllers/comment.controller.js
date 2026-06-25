import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { Comment } from "../models/comment.models.js"
import { Video } from "../models/video.models.js"

const createComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "video Id is not available")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video not found")
    }

    const user = req.user

    if (!user) {
        throw new ApiError(401, "unauthorized")
    }

    const {content} = req.body
    if (!content || content === "") {
        throw new ApiError(400, "contant is not available")
    }
    const commentCreate = await Comment.create({
        owner: user,
        video: videoId,
        content: content.trim()
    })

    const commentCount  = await Comment.countDocuments({
        video : videoId
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201, { comment: commentCreate, commented: true, commentCount }, "Comment added successfully"
            )
        )
})

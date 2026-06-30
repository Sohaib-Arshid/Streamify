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

    const { content } = req.body
    if (!content || content === "") {
        throw new ApiError(400, "contant is not available")
    }
    const commentCreate = await Comment.create({
        owner: user,
        video: videoId,
        content: content.trim()
    })

    const commentCount = await Comment.countDocuments({
        video: videoId
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201, { comment: commentCreate, commented: true, commentCount }, "Comment added successfully"
            )
        )
})

const commentsfetch = asyncHandler(async (req, res) => {
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1) {
        throw new ApiError(400, "invalid page number")
    }

    if (limit < 1) {
        throw new ApiError(400, "invalid limit")
    }

    const skip = (page - 1) * limit;
    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        { $skip: skip },
        { $limit: limit },
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                owner: 1
            }
        }
    ])
    const totalComments = await Comment.countDocuments({ video: videoId });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    comments,
                    totalComments,
                    totalPages: Math.ceil(totalComments / limit),
                    currentPage: parseInt(page),
                },
                "comments fetched successfully"
            )
        )

})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "comment Id is not available")
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "comment not found")
    }

    const user = req.user

    if (!user) {
        throw new ApiError(401, "unauthorized")
    }

    const { content } = req.body
    if (!content || content.trim()) {
        throw new ApiError(400, "contant is not available")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own comments")
    }

    const updatedComment = await Comment.findByIdAndUpdate(comment._id,
        { $set: { content: content.trim() } }, { new: true }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    updatedComment
                },
                "comment update successfully"
            )
        )

})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "comment Id is not available")
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "comment not found")
    }

    const user = req.user

    if (!user) {
        throw new ApiError(401, "unauthorized")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own comments")
    }

    const deletedComment = await Comment.findByIdAndDelete(comment._id)
    const commentCount = await Comment.countDocuments({ video: comment.video })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    deletedComment,
                    deleted: true,
                    commentCount
                },
                "Comment deleted successfully"
            )
        )

})

export { createComment, commentsfetch, updateComment, deleteComment }

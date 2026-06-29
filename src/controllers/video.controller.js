import mongoose from "mongoose";
import { Like } from "../models/like.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Comment } from "../models/comment.models.js";

const uploadVideo = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        throw new ApiError(401, "unauthorized access")
    }

    const { title, description } = req.body;

    if (!title.trim() || !description.trim()) {
        throw new ApiError(400, "please enter tittle and description")
    }

    const getVideoFile = req.files?.videoFile?.[0]?.path
    const getThumbnailFile = req.files?.thumbnail?.[0]?.path

    if (!getVideoFile || !getThumbnailFile) {
        throw new ApiError(400, "Video and thumbnail files are required");
    }

    const video = await uploadOnCloudinary(getVideoFile);
    const thumbnail = await uploadOnCloudinary(getThumbnailFile);

    if (!video.url || !thumbnail.secure_url) {
        throw new ApiError(400, "upload failed");
    }

    const createVideo = await Video.create({
        owner: user._id,
        videoFile: video.url,
        title: title,
        description: description,
        thumbnail: thumbnail.url,
        duration: video.duration,
        isPublished: true
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201, { video: createVideo }, "video uploaded successfully"
            )
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "video is not available")
    }

    const user = req.user

    if (!user) {
        throw new ApiError(401, "unauthorized access")
    }

    const videoWithDetails = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
            }
        }, {
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
        }, {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $addFields: {
                likeCount: { $size: "$likes" },
                commentCount: { $size: "$comments" }
            }
        },
        {
            $project: {
                likes: 0,
                comments: 0,
            }
        },
    ])

    if (videoWithDetails.length === 0) {
        throw new ApiError(404, "video not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    video: videoWithDetails[0],
                },
                "Video fetched successfully"
            )
        );

})

export { uploadVideo, getVideoById }
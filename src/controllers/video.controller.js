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

    const body = {};
    for (const key in req.body) {
        body[key.trim()] = req.body[key];
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

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc", query } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sortOrder = sortType === "asc" ? 1 : -1;
    const sortStage = { [sortBy]: sortOrder };

    const matchStage = {
        isPublished: true,
        ...(query && { title: { $regex: query, $options: "i" } })
    };

    const videos = await Video.aggregate([
        { $match: matchStage },
        { $sort: sortStage },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [{ $project: { fullname: 1, username: 1, avatar: 1 } }]
            }
        },
        { $addFields: { owner: { $first: "$owner" } } },
        { $project: { __v: 0 } }
    ]);

    const totalVideos = await Video.countDocuments(matchStage);

    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            totalVideos,
            totalPages: Math.ceil(totalVideos / limit),
            currentPage: parseInt(page)
        }, "Videos fetched successfully")
    );
});

const getMyUploadedVideos = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        throw new ApiError(401, "Unauthorized access");
    }

    const videos = await Video.find({ owner: user._id }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, videos, "My videos fetched successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const user = req.user;

    if (!user || video.owner.toString() !== user._id.toString()) {
        throw new ApiError(403, "You can only update your own videos");
    }

    const thumbnailLocalPath = req.file?.path;

    let thumbnailUrl = video.thumbnail;

    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (thumbnail?.url) {
            thumbnailUrl = thumbnail.url;
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                ...(title && { title: title.trim() }),
                ...(description && { description: description.trim() }),
                thumbnail: thumbnailUrl
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const user = req.user;

    if (!user || video.owner.toString() !== user._id.toString()) {
        throw new ApiError(403, "You can only delete your own videos");
    }

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(200, { deleted: true, videoId }, "Video deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const user = req.user;

    if (!user || video.owner.toString() !== user._id.toString()) {
        throw new ApiError(403, "You can only update your own videos");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: { isPublished: !video.isPublished } },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Publish status toggled successfully")
    );
});

export { uploadVideo, getVideoById, getAllVideos, getMyUploadedVideos, updateVideo, deleteVideo, togglePublishStatus };
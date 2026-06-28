import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
        durattion: video.duration,
        isPublished: true
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201, { video: createVideo}, "video uploaded successfully"
            )
        )
})

export { uploadVideo }
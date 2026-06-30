import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Video } from "../models/video.models";
import { ApiResponse } from "../utils/ApiResponse";

const searchApi = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 10, } = req.query

    if (!search || search.trim().length < 3) {
        throw new ApiError(400, "Search query is required")
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const searchVideos = await Video.aggregate([
        {
            $match: {
                isPublished: true,
                $or: [
                    { title: { $regex: search.trim(), $options: "i" } },
                    { description: { $regex: search.trim(), $options: "i" } }
                ]
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $skip: skip
        },
        { $limit: limitNum },
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
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                owner: 1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                searchVideos,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalVideos / limitNum),
                    limit: limitNum
                }
            },
            "Videos fetched successfully"
        )
    )
});

export { searchApi };
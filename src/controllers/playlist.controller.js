import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js"
import { Video } from "../models/video.models.js"
import { Playlist } from "../models/playlist.models.js"
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {

    const user = req.user

    if (!user) {
        throw new ApiError(401, "unauthorized access");
    }

    const { name, description, isPublic } = req.body;

    if (!name || name.trim() === "") {
        throw new ApiError(400, "Bad request")
    }

    const playlistCreate = await Playlist.create({
        owner: req.user._id,
        name: name,
        description: description,
        isPublic: isPublic,
        video: []
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201, { playlist: playlistCreate }, "Playlist created successfully"
            )
        )
})

const getPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }

    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Unauthorized access");
    }

    const playlistExists = await Playlist.findById(playlistId);
    if (!playlistExists) {
        throw new ApiError(404, "Playlist does not exist");
    }

    const playlistAndOwner = await Playlist.aggregate([
    {
        $match: {
            _id: new mongoose.Types.ObjectId(playlistId)
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
                        avatar: 1,
                        username: 1
                    }
                }
            ]
        }
    },
    {
        $addFields: {
            owner: { $first: "$owner" }
        }
    },
    {
        $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "video",
            pipeline: [
                {
                    $project: {
                        title: 1,
                        thumbnail: 1,
                        duration: 1,
                        views: 1,
                        owner: 1
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
                                    avatar: 1,
                                    username: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        owner: { $first: "$owner" }
                    }
                }
            ]
        }
    },

    {
        $addFields: {
            totalVideos: { $size: "$video" }
        }
    }
]);

    if (!playlistAndOwner || playlistAndOwner.length === 0) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlistAndOwner[0],
            "Playlist fetched successfully"
        )
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params;

    if (!videoId || !playlistId) {
        throw new ApiError(400, "Bad request");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "playlist not exist");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "video not exist");
    }

    const user = req.user

    if (!user) {
        throw new ApiError(400, "unauthorized access");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Forbidden");
    }

    const existVideo = playlist.video.map(v => v.toString()).includes(videoId)

    if (existVideo) {
        throw new ApiError(409, "Video already exist in playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { video: videoId }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Video add successfully in playlist"
            )
        );
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params;

    if (!videoId || !playlistId) {
        throw new ApiError(400, "Video ID and Playlist ID are required");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    const user = req.user;

    if (!user) {
        throw new ApiError(401, "Unauthorized access");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only modify your own playlists");
    }

    const videoExists = playlist.video.some(
        id => id.toString() === videoId
    );

    if (!videoExists) {
        throw new ApiError(404, "Video not found in playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { video: videoId }  
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Video removed from playlist successfully"
            )
        );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    const user = req.user;

    if (!user) {
        throw new ApiError(401, "Unauthorized access");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own playlists");
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { deleted: true, playlistId },
                "Playlist deleted successfully"
            )
        );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    const user = req.user;

    if (!user) {
        throw new ApiError(401, "Unauthorized access");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own playlists");
    }

    const { name, description, isPublic } = req.body;

    if (!name && !description && isPublic === undefined) {
        throw new ApiError(400, "At least one field is required to update");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                ...(name && { name: name.trim() }),
                ...(description && { description: description.trim() }),
                ...(isPublic !== undefined && { isPublic })
            }
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Playlist updated successfully"
            )
        );
});

export { 
    createPlaylist, 
    getPlaylist, 
    addVideoToPlaylist, 
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};
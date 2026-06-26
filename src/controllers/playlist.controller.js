import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js"
import { Video } from "../models/video.models.js"
import {Playlist} from "../models/playlist.models.js"

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
        video : []
    })

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201, { playlist: playlistCreate}, "Playlist created successfully"
                )
            )
})

export {createPlaylist}
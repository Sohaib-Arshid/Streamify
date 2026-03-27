import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const register = asyncHandler(async (req, res) => {
    const { fullname, email, password, username } = req.body;

    if (!fullname || !email || !password || !username) {
        throw new ApiError(400, "All fields are required")
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] })
    if (existing) {
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImagePath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    let coverImagePath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImage = await req.files.coverImage[0]?.path
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImagePath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }

    const register = await User.create({
        fullname,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createUser = await User.findById(register._id).select("-password -refresToken")

    if (!createUser) {
        throw new ApiError(500, "Something went wrong while registring the user")
    }

    return res.status(201).json(
        new ApiResponse(201, createUser, "User register successfully")
    )
})

export {register}
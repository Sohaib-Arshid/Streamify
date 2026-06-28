import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js"
import { Like } from "../models/like.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.models.js"

// ==================== TOKEN GENERATION ====================

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { refreshToken, accessToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

// ==================== REGISTER ====================

const register = asyncHandler(async (req, res) => {
    const { fullname, email, password, username } = req.body;

    if (!fullname || !email || !password || !username) {
        throw new ApiError(400, "All fields are required")
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] })
    if (existing) {
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    let coverImagePath;
    if (req.files?.coverImage?.length > 0) {
        coverImagePath = req.files.coverImage[0].path
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed")
    }

    const coverImage = coverImagePath
        ? await uploadOnCloudinary(coverImagePath)
        : null;

    const registeredUser = await User.create({
        fullname,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(registeredUser._id)
        .select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
})

// ==================== LOGIN ====================

const login = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials")
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    }

    return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            }, "User logged in successfully")
        )
})

// ==================== LOGOUT ====================

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    )

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    }

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = await req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthrized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id)

        if (!user) {
            throw new ApiError(401, "unauthrized request")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh Token is expired or used ")
        }

        const option = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", newRefreshToken, option)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "access token refresh successfully"
                )
            )
    } catch (error) {
        throw new ApiError(error?.message || "invalid refresh token")
    }
})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req?.user._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "old password is incorrect")
    }

    user.password = password;
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "password changed successfully")
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "user fatched successfully")

})

const updateAccountDetailes = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "Email or password are required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, { $set: { fullname, email } }, { new: true }).select("-password")
    return res
        .status(200)
        .json(200, user, "Account details updated successfully")
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar || !avatar.url) {
        throw new ApiError(400, "Error while uploading avatar")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        }, { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(200, user, "Avatar updated successfully")
})

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "cover image is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "error while uploading on cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        }, { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(200, user, "Avatar updated successfully")
})

const getUserChannalProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "Username is messing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "Subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscriber"
            }
        },
        {
            $lookup: {
                from: "Subscriptions",
                localField: "_id",
                foreignFeild: "subscriber",
                as: "subscribeTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscriber"
                },
                channalSubscribeCount: {
                    $size: $subscribeTo
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscriber : subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscriberCount: 1,
                channalSubscribeCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                createdAt: 1
            }
        }
    ])

    if (!channal?.length) {
        throw new ApiError(400, "channel does not exists")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            channel[0],
            "Channel fetched successfully"
        )
    )
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        throw new ApiError(401, "Unauthorized access");
    }
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
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
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json({
            success: true,
            statusCode: 200,
            message: "Watch history fetched successfully",
            data: user[0].watchHistory
        });
})

const increaseViewCount = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "video is not available")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "video does not exist")
    }

    const user = req.user;

    if (!user) {
        throw new ApiError(401, "user is not available")
    }

    const checkVideo = user.watchHistory.some(id => id.toString() === videoId)

    if (checkVideo) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200, { alreadyWatched: true, views: video.views }, "video watched successfully"
                )
            )
    }
    const increasedView = await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }, { new: true })
    if (increasedView === null) {
        throw new ApiError(400, "view does not increase")
    }
    const watchHistoryadd = await User.findByIdAndUpdate(user._id, { $addToSet: { watchHistory: videoId } }, { new: true })
    if (watchHistoryadd === null) {
        throw new ApiError(400, "watchHistory does not increase")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, increasedView, "view updated successfully"
            )
        )
})

const likefeature = asyncHandler(async (req, res) => {
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

    const existingLike = await Like.findOne({
        user: user._id,
        video: videoId
    });

    if (!existingLike) {
        const createLike = await Like.create({
            user: user._id,
            video: videoId
        })

        const likeCount = await Like.countDocuments({ video: videoId })

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201, { like: createLike, liked: true, likeCount }, "video liked successfully"
                )
            )
    } else {
        const deleteLike = await Like.deleteOne({
            user: user._id,
            video: videoId
        })

        const likeCount = await Like.countDocuments({ video: videoId })

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200, { liked: false, likeCount }, "video unliked successfully"
                )
            )
    }

})

const comment = asyncHandler(async (req, res) => {

})
// ==================== EXPORTS ====================

export {
    register, login, logout, refreshAccessToken,
    changePassword, getCurrentUser, updateAccountDetailes, updateCoverImage,
    getUserChannalProfile, getWatchHistory, increaseViewCount, likefeature, updateUserAvatar
}
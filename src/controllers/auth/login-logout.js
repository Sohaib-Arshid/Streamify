import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import { User } from "../../models/user.models.js"

const genrateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })
        return { refresToken, accessToken }
    } catch (error) {
        throw new ApiError(404, "something went wrong while accessing and genrating token")
    }
}

const login = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not found!")
    }

    const passwordCheck = await user.npasswordcorrect(password);

    if (!passwordCheak) {
        throw new ApiError(401, "Password is not correct!")
    }

    const { refresToken, accessToken } = await genrateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refresToken")

    const cookieOption = {
        httpOnly: true,
        secure: true
    }

    console.log("BODY:", req.body)

    return res.status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refresToken", refresToken, cookieOption)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, accessToken, refresToken
            },
                "User logged in successfully"
            )
        )
})

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        { new: true }
    )

    const cookieOption = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", cookieOption)
        .clearCookie("refreshToken", cookieOption)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})
export { login, logout }
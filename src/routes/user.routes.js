import { Router } from "express";
import { register, login, logout, refreshAccessToken, changePassword, getCurrentUser, updateAccountDetailes, updateCoverImage, getUserChannalProfile, getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    register
)

router.route("/login").post(login)
router.route("/logout").post(verifyJWT, logout)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changePassword)
router.route("/update-account-detailes").patch(verifyJWT, updateAccountDetailes)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"),  updateUserAvatar)
router.route("/cover-image-update").patch(verifyJWT, upload.single("coverImage"),  updateCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannalProfile)
router.route("/history").get(verifyJWT,getWatchHistory)


export default router
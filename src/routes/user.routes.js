import { Router } from "express";
import { register, login, logout, refreshAccessToken, changePassword, getCurrentUser, updateAccountDetailes, updateCoverImage, getUserChannalProfile, getWatchHistory, increaseViewCount, likefeature } from "../controllers/user.controller.js";
import { commentsfetch, createComment } from "../controllers/comment.controller.js";
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
router.route("/channel/:username").get(verifyJWT, getUserChannalProfile)
router.route("/watch/:videoId").patch(verifyJWT, increaseViewCount)
router.route("/history").get(verifyJWT,getWatchHistory)
router.route("/like/toggle/v/:videoId").post(verifyJWT, likefeature);
router.route("/comment/:videoId").post(verifyJWT, createComment);
router.route("/comments/:videoId").get(verifyJWT, commentsfetch);


export default router
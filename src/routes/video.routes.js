// video.routes.js
import { Router } from "express";
import {
    uploadVideo,
    getVideoById,
    getAllVideos,
    getMyUploadedVideos,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(getAllVideos);
router.route("/my-videos").get(verifyJWT, getMyUploadedVideos);
router.route("/upload").post(verifyJWT, upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]), uploadVideo);
router.route("/:videoId").get(verifyJWT, getVideoById);
router.route("/:videoId").patch(verifyJWT, upload.single("thumbnail"), updateVideo);
router.route("/:videoId").delete(verifyJWT, deleteVideo);
router.route("/toggle/:videoId").patch(verifyJWT, togglePublishStatus);

export default router;
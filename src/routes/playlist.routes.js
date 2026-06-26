import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    createPlaylist,
    getPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist
} from "../controllers/playlist.controller.js";

const router = Router();

// Create Playlist
router.route("/")
    .post(verifyJWT, createPlaylist);

// Get Single Playlist
router.route("/:playlistId")
    .get(verifyJWT, getPlaylist);

// Update Playlist
router.route("/:playlistId")
    .patch(verifyJWT, updatePlaylist);

// Delete Playlist
router.route("/:playlistId")
    .delete(verifyJWT, deletePlaylist);

// Add Video To Playlist
router.route("/:playlistId/video/:videoId")
    .patch(verifyJWT, addVideoToPlaylist);

// Remove Video From Playlist
router.route("/:playlistId/video/:videoId")
    .delete(verifyJWT, removeVideoFromPlaylist);

export default router;
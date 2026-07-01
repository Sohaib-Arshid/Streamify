import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import videoRouter from "./routes/video.routes.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
}));
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import searchRouter from "./routes/search.routes.js"

// app.js - routes ke baad
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
});

app.use("/api/v1/users", userRouter); 
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/search", searchRouter);

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "Server is running" });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

export { app };
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { searchApi } from "../controllers/search.controller.js";

const router = Router();

router.route("/search").get(searchApi)

export default router;
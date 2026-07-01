import { Router } from "express";
import { searchApi } from "../controllers/search.controller.js";

const router = Router();

router.get("/", searchApi);  // ← "/" not "/search"

export default router;
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkUser } from "../middlewares/openAuth.middleware.js";
import { addComment, deleteComment, getVideoComment, updateComment } from "../controllers/comment.controller.js";

const router = Router()

router.route("/:videoId").get(checkUser, getVideoComment)
router.route("/:videoId").post(verifyJWT,addComment)
router.route("/c/:commentId").delete(verifyJWT,deleteComment)
router.route("/c/:commentId").patch(verifyJWT,updateComment)

export default router
import { Router } from "express";
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
    getUserVideos,
    getSubscribedVideos,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkUser } from "../middlewares/openAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(getAllVideos);
router.route("/c/:userId").get(getUserVideos);
router.route("/:videoId").get(verifyJWT, getVideoById);

router.use(verifyJWT)
.post("/",
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    publishAVideo
)


.delete("/:videoId",deleteVideo)
.patch("/:videoId", upload.single("thumbnail"), updateVideo)
.patch("/toggle/publish/:videoId", togglePublishStatus)
.get("/s/subscription",getSubscribedVideos);

export default router;
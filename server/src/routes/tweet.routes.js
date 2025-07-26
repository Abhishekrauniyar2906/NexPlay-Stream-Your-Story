import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getAllTweets,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { checkUser } from '../middlewares/openAuth.middleware.js';

const router = Router();

router.route("/user/:userId").get(checkUser, getUserTweets);
router.route("/").get(getAllTweets);

router.use(verifyJWT)
.post("/",createTweet)
.patch("/:tweetId",updateTweet)
.delete("/:tweetId",deleteTweet);

export default router
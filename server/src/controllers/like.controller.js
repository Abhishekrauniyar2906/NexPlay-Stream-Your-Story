import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like,} from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const toggleVideoLike = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"video not found by videoId")
    }

    const isLiked = await Like.findOne({
        video:videoId,
        likedBy:req.user?._id
    })

    if(isLiked){
        const removeLike= await Like.findByIdAndDelete(isLiked._id)
        if(!removeLike){
            throw new ApiError(500,"error while removing like")
        }
    }
    else{
        const liked = await Like.create({
            video:videoId,
            likedBy:req.user?._id
        })
        if(!liked){
            throw new ApiError(500, "errror while adding like to video")
        }
    }

    return res.status(200)
    .json(new ApiResponse(200,{},"like status updated"))


})

const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId}= req.params

    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400,"comment not found by id")
    }

    console.log(commentId)

    const isLiked= await Like.findOne({
        Comment:commentId,
        likedBy:req.user?._id
    })
    console.log("isliked",isLiked)

    if(isLiked){
        const removeLike = await Like.findByIdAndDelete(isLiked._id)
        if(!removeLike){
            throw new ApiError(500,"error while disliking comment")
        }
    }
    else{
        await Like.create({
            Comment:commentId,
            likedBy:req.user?._id
        })
        throw new ApiError(500,"error while liking comment")
    }

    return res.status(200)
    .json(new ApiResponse(200,{},"like status updated"))
})

const toggleTweetLike = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params

    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(400,"tweet not found")
    }

    const isLiked = await Like.findOne({
        tweet:tweetId,
        likedBy:req.user?._id
    })

    if(isLiked){
        const removeLike= await Like.findByIdAndDelete(isLiked._id)
        if(!removeLike){
            throw new ApiError(500,"error while removing like")
        }
    }

    // if(isLiked){
    //     const removeLike = await Like.findByIdAndDelete(isLiked._id)
    //     if(!removeLike){
    //         throw new ApiError(500,"error while disliking tweet")
    //     }
    // }
    else{
        const like = await Like.create({
            tweet:tweetId,
            likedBy:req.user?._id
        })
        if(!like){
            throw new ApiErrorr(500,"error while liking tweet")
        }
    }

    return res.status(200)
    .json(new ApiResponse(200,{},"like status updated"))
})

const getLikedVideos = asyncHandler(async(req,res)=>{
    const {page=1,limit=10} = req.query
    console.log("videos")

    const likedVideos= await Like.aggregate([
        {
            $match:{
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $skip:(page-1)*limit
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video",
                pipeline:[
                    {
                        $match:{
                            ispublished:true
                        }
                    },
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        fullName:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                video:{
                    $first:"$video"
                }
            }
        },
        {
            $match:{
                video: {
                    $exists:true
                }
            }
        },
        {
            $project:{
                username:1,
                avatar:1,
                video:1,
                thumbnail:1,
            }
        }
    ])

    if(!likedVideos){
        throw new ApiError(500,"error while getting liked videos")
    }

    console.log(likedVideos)

    return res.status(200)
    .json(new ApiResponse(200,likedVideos,"liked video fetched successfully"))
})

export {
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    getLikedVideos
}
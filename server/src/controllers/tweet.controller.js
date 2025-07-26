import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createTweet = asyncHandler( async(req,res)=>{
    const {content} = req.body

    if(!content.trim()){
        throw new ApiError(400,"connent must required for tweet")
    }

    const tweet = await Tweet.create({
        content: content,
        owner: req.user?._id
    })

    if(!tweet){
        throw new ApiError(500,"error while creating tweet")
    }

    return res.status(200)
    .json(new ApiResponse(200,tweet,"tweet created successfully"))
})

const updateTweet = asyncHandler(async (req,res)=>{
    const {tweetId}= req.params;
    const {content} = req.body;

    console.log("tweet id",tweetId)

    if(!content.trim()){
        throw new ApiError(400,"content cannot be empty")
    }

    if(!tweetId ||!isValidObjectId(tweetId)){
        throw new ApiError(400,"tweet id is noty valid")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(500,"tweet not found")
    }

    if(tweet.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(400,"only owner can update the tweet")
    }

    const updatedtweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    )

    if(!updatedtweet){
        throw new ApiError(500,"error file updating tweet")
    }
    console.log(updatedtweet)

    const tweetWithDetails = await Tweet.aggregate([
        {
            $match:{
                _id: updatedtweet._id
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
                            _id:1,
                            username:1,
                            avatar:1,
                            fullname:1
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
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"tweet",
                as:"likes"
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likes"
                },
                isLiked:{
                    $cond:{
                        if:{$in:[req.user?._id, "$likes.likedBy"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                _id:1,
                owner:1,
                content:1,
                likesCount:1,
                isLiked:1,
                updatedAt:1,
                createdAt:1
            }
        }
    ])

    if(!tweetWithDetails.length){
        throw new ApiError(500,"error while fetching updated tweet details")
    }

    return res.status(200)
    .json(new ApiResponse(200,tweetWithDetails[0,"tweet updated successfully"]))

})

const deleteTweet = asyncHandler(async(req,res)=>{
    const {tweetId}= req.params

    if(!tweetId ||!isValidObjectId(tweetId)){
        throw new ApiError(400,"error in tweetId ")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(500 ,"error while finding tweet")
    }

    if(tweet.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(400,"you don't have access for deleting tweet")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if(!deleteTweet){
        throw new ApiError(500,"error while deleting tweet")
    }

    return res.status(200)
    .json(new ApiResponse(200,{},"tweet deleted successfullt"))
})

const getUserTweets = asyncHandler(async(req,res)=>{
    const {userId} = req.params
    const {page=1,limit=30} = req.query
console.log(userId)
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"no valid user found")
    }

    const tweets = await Tweet.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
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
            $limit:parseInt(limit)
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
                            avatar:1,
                            fullName:1,
                            _id:1
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
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"tweet",
                as:"likes"
            }
        },
        {
            $addFields:{
                likesCount:{
                    $sum:"$owner"
                },
                isliked:{
                    $cond:{
                        if:{$in:[req.user?._id,"$likes.likedBy"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                _id:1,
                owner:1,
                content:1,
                isliked:1,
                likesCount:1,
                createdAt:1,
                updatedAt:1
            }
        },
    ])

    if(!tweets){
        throw new ApiError(401,"error while fetching tweet")
    }

    return res.status(200)
    .json(new ApiResponse(200,tweets,"tweet fetched successfully"))
})

const getAllTweets = asyncHandler(async(req,res)=>{
    const {page=1,limit=30} = req.query

    const tweets = await Tweet.aggregate([
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $skip:(page-1)*limit
        },
        {
            $limit:parseInt(limit)
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        }, 
        // {
        //     $unwind: {
        //         path: "$owner",
        //     }
        // },
        
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"tweet",
                as:"likes"
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likes"
                },
                isliked:{
                    cond:{
                        if:{$in:[req.user?._id,"$likes.likedBy"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                _id:1,
                owner:1,
                content:1,
                isliked:1,
                likesCount:1,
                createdAt:1,
                updatedAt:1
            }
        }
    ])

    if(!tweets){
        throw new ApiError(402,"error while fetching tweets")
    }

    return res.status(200)
    .json(new ApiResponse(200,tweets,"tweets fetched successsfullt"))
})

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getAllTweets,
    getUserTweets
}
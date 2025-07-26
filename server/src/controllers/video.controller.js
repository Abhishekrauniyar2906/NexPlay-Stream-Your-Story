import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {Subscription} from "../models/subcription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js";
import fs from 'fs';
import path from 'path';
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req,res)=>{

    const {page=1, limit=10, query, sortBy="createdAt", sortType="desc", }= req.query

    const videos = await Video.aggregate([
        ...(query
            ? [
                {
                    $match: {
                        $or: [
                            {
                                title: { 
                                    $regex: query, $options: "i" 
                                },
                            },
                            {
                                description: { 
                                    $regex: query, $options: "i" 
                                },
                            },
                        ],
                    },
                },
            ]
        : []),
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
                            avatar:1,
                            fullName:1,
                            username:1
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

            $sort:{
                [sortBy]:sortType ==="asc"?1:-1
            }
        },
        {
            $skip:(page-1)*limit
        },
        {
            $limit:parseInt(limit)
        },
        {
            $project:{
                _id:1,
                owner:1,
                videoFile:1,
                thumbnail: 1,
                createdAt: 1,
                description: 1,
                title: 1,
                duration: 1,
                views: 1,
                ispublished: 1,
            }
        }
    ])

    if (!videos.length) {
        throw new ApiError(400, "No videos found")
    }

    return res.status(200)
    .json(new ApiResponse(200,videos,"video fetched successfully"))
})

const getUserVideos = asyncHandler(async(req,res)=>{
    const {page=1,limit=10, sortType="desc"}= req.query
    const {userId}= req.params

    if(!userId ||!isValidObjectId(userId)){
        throw new ApiError(400,"videos not found")
    }
    
    const videos = await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
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
                            avatar:1,
                            fullName:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"videos",
                as:"likes"
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"videos",
                as:"comments"
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                },

            }
        },
        {
            $sort:{
                createdAt:sortType === "asc"? 1:-1
            }
        },
        {
            $skip:(page-1)*limit
        },
        {
            $limit:parseInt(limit)
        },
        {
            $project:{
                _id: 1,
                owner: 1,
                videoFile: 1,
                thumbnail: 1,
                createdAt: 1,
                description: 1,
                title: 1,
                duration: 1,
                views: 1,
                ispublished: 1,
            }
        }
    ])


    if (!videos.length) {
        throw new ApiError(400, "No videos found")
    } 

    return res.status(200)
    .json(new ApiResponse(200, videos,"all videos fetched successfully"))

})
 

const publishAVideo = asyncHandler(async(req,res)=>{
    const {title, description}= req.body
    const videoLocalPath = req.files?.videoFile[0].path
    const thumbnailLocalPath = req.files?.thumbnail[0].path

    if(!title ||title.trim()===""){
        throw new ApiError(400,"title is required")
    }

    if (!videoLocalPath) {
        if (thumbnailLocalPath) {
            fs.unlinkSync(thumbnailLocalPath);
        }
        throw new ApiError(400, "Video is required");
    }
    
    if (!thumbnailLocalPath) {
        if (videoLocalPath) {
            fs.unlinkSync(videoLocalPath);
        }
        throw new ApiError(400, "Thumbnail is required");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoFile || !thumbnail){
        throw new ApiError(400," video or thumbnail not uploaded on cloudinary")
    }

    const video = await Video.create({
        videoFile: videoFile?.secure_url,
        thumbnail: thumbnail?.secure_url,
        title: title,
        description: description,
        duration: videoFile?.duration,
        owner: req.user?._id
    })

    if(!video){
        throw new ApiError(500,"error while uploading video")
    }

    return res.status(200)
    .json( new ApiResponse(200,video,"video uploaded successfully"))

})

const getVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    console.log("Video ID:", videoId);

    if(!videoId ||!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video id")
    }

    const video = await Video.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(videoId),
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
                        $lookup:{
                            from:"subscriptions",
                            localField:"_id",
                            foreignField:"channel",
                            as:"subscribers",
                            
                        }

                    },
                    {
                        $addFields:{
                            subscriberCount:{
                                $size: "$subscribers",
                            },
                            isSubscribed:{
                                $cond:{
                                    if:{$in:[req.user?._id, "$subscribers.subscriber"]},
                                    then:true,
                                    else:false
                                    
                                }
                            }
                        }
                    },
                    {
                        $project:{
                            fullName:1,
                            username:1,
                            avatar:1,
                            isSubscribed:1,
                            subscriberCount:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes",
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                },
                likesCount:{
                    $size:"$likes"
                },
                isLiked:{
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
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                owner: 1,
                createdAt: 1,
                comments: 1,
                likesCount: 1,
                isLiked: 1,
            }
        }
    ])


    if (!video || !video.length) {
        throw new ApiError(404, "Video does not exist");
    }

    await Video.findByIdAndUpdate(videoId,{
        $inc:{
            views:1
        }
    })

    await User.findByIdAndUpdate(req.user?._id, {
        $addToSet:{
            watchHistory: videoId,
        }
    })

    return res.status(200)
    .json(new ApiResponse(200, video[0], "video fetched successfully"))
})

const updateVideo = asyncHandler(async(req,res)=>{
    const {title, description}= req.body
    const {videoId} = req.params
    // const thumbnailLocalPath = req.files?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    const unLinkPath = (filePath) => {
        if (filePath) {
          
            fs.unlinkSync(filePath);
        }
    }

    console.log("videoid",videoId)

    if(!videoId ||!isValidObjectId(videoId)){
        unLinkPath(thumbnailLocalPath)
        throw new ApiError(401," invalid video id ")
    }

    if(!title && !description &&!thumbnailLocalPath){
        unLinkPath(thumbnailLocalPath)
        throw new ApiError(401,"atleat one field is required")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"video not found")
    }

    if(req.user?._id.toString() !== video?.owner.toString()){
        unLinkPath(thumbnailLocalPath)
        throw new ApiError(400,"you do not have to perform this activity")
    }

    let thumbnail;
    if(thumbnailLocalPath){
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        if(!thumbnail){
            throw new ApiError(400,"error while uploading thumbnail")
        }
        else{
            const thumbnailUrl = video?.thumbnail
            const regex = /\/([^/]+)\.[^.]+$/;
            const match = thumbnailUrl.match(regex);
    
            if(!match){
                throw new ApiError(400,"couldn't find publicID of old thumbnail")
            }
            const publicId= match[1]
            await deleteFromCloudinary(publicId)
        }
    

    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId,
        {
        $set:{
            title: title || video?.title,
            description: description || video?.description,
            thumbnail: thumbnail?.secure_url || video?.thumbnail,
            },

        }
    )

    if(!updatedVideo){
        throw new ApiError(500,"error while updating video")
    }
    
    return res.status(200)
    .json(new ApiResponse(200,updatedVideo,"video updated successfully"))
})

const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId}= req.params

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video ID")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"no video found")
    }

    if(video?.owner.toString()!== req.user?._id.toString()){
        throw new ApiError(400,"you don't have to delete this video")
    }

    await Video.findByIdAndDelete(videoId)

    const thumbnailUrl = video?.thumbnail
    const videoFileUrl = video?.videoFile
    const regex = /\/([^/]+)\.[^.]+$/;


    let match = thumbnailUrl.match(regex)
    if(!match){
        throw new ApiError(400,"couldn't find publicID of thumbnail")
    }
    let publicId =match[1]
    const deleteThumbnail = await deleteFromCloudinary(publicId);


    match = videoFileUrl.match(regex)
    if(!match){
        throw new ApiError(400,"couldn't find publicID of tvideo file")
    }
    publicId =match[1]
    const deleteVideoFile = await deleteFromCloudinary(publicId)

    if(deleteThumbnail.result !=="ok"){
        throw new ApiError(500,"error while deleting thumbnail from cloudinary")
    }

    if(deleteVideoFile.result !== "ok"){
        throw new ApiError(500,"error while deleting video file from cloudinary")
    }

    return res.status(200)
    .json(new ApiResponse(200, {},"video deleted successfully"))



})

const togglePublishStatus = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!videoId ||!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video ID")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"video not found")
    }

    if(req.user?._id.toString() !== video.owner.toString()){
        throw new ApiError(400," you don't have access to publish this video")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: { ispublished: !video?.ispublished },
        },
        {
            new: true,
        }
    );

    return res.status(200)
    .json(new ApiResponse(200, updatedVideo,"publish status toggle successfully"))

})

const getSubscribedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortType = "desc" } = req.query;

    const subscriptions = await Subscription.find({
        subscriber: new mongoose.Types.ObjectId(req.user?._id),
    }).select("channel");

    console.log("subscriptions",subscriptions)

    const channelIds = subscriptions.map((sub) => sub.channel);
    console.log("channelIds",channelIds)

    if (channelIds.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No subscribed channels found"));
    }

    const videos = await Video.aggregate([
        {
            $match: {
                owner: {
                    $in: channelIds.map(
                        (id) => new mongoose.Types.ObjectId(id)
                    ),
                },
            },
        },
        {
            $match: { ispublished: true },
        },
        {
            $sort: {
                createdAt: sortType === "asc" ? 1 : -1,
            },
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: parseInt(limit),
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            username: 1,
                            fullName: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
            },
        },
        {
            $project: {
                _id: 1,
                owner: 1,
                videoFile: 1,
                thumbnail: 1,
                createdAt: 1,
                description: 1,
                title: 1,
                duration: 1,
                views: 1,
                ispublished: 1,
            },
        },
    ]);
    console.log("videeos",videos)

    if (!videos) {
        throw new ApiError(404, "Error while fetching videos");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "Subscribed videos fetched successfully"
            )
        );
});

export{
    getAllVideos,
    getUserVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getSubscribedVideos
}
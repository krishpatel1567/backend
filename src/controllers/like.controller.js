import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const likerId = req.user?._id
    //TODO: toggle like on video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "video not found")
    }

    if (likerId.toString() === video.owner.toString()) {
        throw new ApiError(400, "Your cannot like your own video")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: likerId
    })

    let message;
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        message = "Like removed"
    } else {
        await Like.create({ 
            video: videoId,
            likedBy: likerId
        })
        message = "Liked Successfully"
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, message))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    const likerId = req.user._id

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (likerId.toString() === comment.owner.toString()) {
        throw new ApiError(400, "Your cannot like your own comment")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: likerId
    })

    let message;
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        message = "Like removed"
    } else {
        await Like.create({ 
            comment: commentId,
            likedBy: likerId
        })
        message = "Liked Successfully"
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, message))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    const likerId = req.user._id

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (likerId.toString() === tweet.owner.toString()) {
        throw new ApiError(400, "Your cannot like your own tweet")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: likerId
    })

    let message;
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        message = "Like removed"
    } else {
        await Like.create({ 
            tweet: tweetId,
            likedBy: likerId
        })
        message = "Liked Successfully"
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, message))

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true, $ne: null }
            }
        },
        
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $lookup: {
                from: "users",
                localField: "videoDetails.owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: "$ownerDetails"
        },
        {
            $project: {
                _id: 0,
                videoId: "$videoDetails._id",
                title: "$videoDetails.title",
                description: "$videoDetails.description",
                thumbnail: "$videoDetails.thumbnail",
                duration: "$videoDetails.duration",
                views: "$videoDetails.views",
                owner: "$ownerDetails.username",
                ownerAvatar: "$ownerDetails.avatar",
                likedAt:  { $toDate: "$_id" } 
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
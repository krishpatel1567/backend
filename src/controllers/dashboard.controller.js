import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const user = req.user?._id
    if (!user) throw new ApiError(404, "invalid user")
    const statsData = await User.aggregate([
        {
            $match: {
                _id:user
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
                pipeline:[
                    {
                        $lookup:{
                            from:"likes",
                            localField:"_id",
                            foreignField:"video",
                            as:"likes"
                        }
                    },
                    {
                        $addFields:{
                            videoLikeCount:{
                                $size:"$likes"
                            }
                        }
                    },
                    {
                        $project:{likes:0}
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                totalVideos:{
                    $size:"$videos"
                },
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                totalViews:{
                    $sum:"$videos.views"
                },
                totalLikes:{
                    $sum:"$videos.videoLikeCount"
                }
            }
        },
        {
            $project:{
                _id:0,
                username:1,
                fullName:1,
                totalVideos:1,
                subscribersCount:1,
                channelSubscribedToCount:1,
                totalViews:1,
                totalLikes:1
            }
        }

    ])
    if (!statsData || statsData.length === 0) {
        throw new ApiError(500, "Unable to fetch channel stats");
    }

    return res.status(200).json(
        new ApiResponse(200, statsData[0], "Channel stats fetched successfully")
    );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user?._id
    const {page = 1,limit=10} = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);


    const channelVideos = await Video.aggregate([
        {
            $match:{owner:userId}
        },
        {
            $sort:{createdAt:-1}
        },
        {
            $skip:(pageNumber - 1)*limitNumber
        },
        {
            $limit:limitNumber
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }
        },
        {
            $addFields:{
                likesCount:{$size:"$likes"}
            }
        },
        {
            $project:{
                likes:0
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,channelVideos,"video fetched Successfully"))
})

export {
    getChannelStats,
    getChannelVideos
}
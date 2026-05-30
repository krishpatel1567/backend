import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required for a tweet")
    }

    const newTweet = await Tweet.create({
        content,
        owner: req.user?._id
    })


    return res.status(201).json(
        new ApiResponse(201, newTweet, "Tweet created succesfully")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { page = 1, limit = 10, userId } = req.query

    if (!userId) {
        throw new ApiError(400, "userId invalid")
    }
    const matchStage = {
        $match: {}
    };

    if (userId && isValidObjectId(userId)) {
        matchStage.$match.owner = new mongoose.Types.ObjectId(userId);
    }

    const sortStage = { createdAt: -1 };

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: sortStage,
        customLabels: {
            totalDocs: "totalTweets",
            docs: "tweets"
        }
    };

    const result = await Tweet.aggregatePaginate(
        Tweet.aggregate([matchStage]),
        options
    );

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Tweets fetched succesfully"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body
    
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    if (!content) {
        throw new ApiError(400, "Content need to update tweet")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404 , "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,{ $set: { content } }, {new : true})

    return res
    .status(200)
    .json(new ApiResponse(200,updatedTweet,"Successfully Updated the tweet"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400,"invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404,"Tweet not Found")
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403 , "You are not authorized to delete Tweet")
    }

    await Tweet.findByIdAndDelete(tweetId)
    
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Tweet Deleted Successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
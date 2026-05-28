import { ApiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/assyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"


export const verifyJWt = asyncHandler(async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization")
        const tokenFromHeader = authHeader && authHeader.startsWith("Bearer ") 
            ? authHeader.slice(7)
            : null
        
        const token = req.cookies?.accessToken || tokenFromHeader
    
        if(!token){
            throw new ApiError(401,"Unathorized request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user=user;
        next()
    } catch (error) {
        throw error
    }
})
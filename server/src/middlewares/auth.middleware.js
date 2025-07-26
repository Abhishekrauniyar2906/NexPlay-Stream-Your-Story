import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import {User} from "../models/user.model.js"


export const verifyJWT = asyncHandler(async (req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        console.log("Request Headers:", req.headers);
        console.log('Token extracted:', token); // Log the extracted token
        console.log(req.header("Authorization")); 
        if(!token){
            throw new ApiError(402,"unauthorized request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"invalid access token")
        }
    
        req.user = user;
        next()
    } 
    catch (error) {
        throw new ApiError (401, error?.message ||"invalid access token")
    }
    

})

// export const verifyJWT = asyncHandler(async (req, res, next) => {
//     try {
//         // Log the entire headers object to inspect the headers
//         console.log("Request Headers:", req.headers);

//         // Try to extract the token from Authorization header or cookies
//         const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ", "");

//         // Log the token extracted
//         console.log("Extracted Token:", token);

//         // If no token is found, return an unauthorized error
//         if (!token) {
//             throw new ApiError(401, "Unauthorized request");
//         }

//         // Verify the token using the secret key
//         const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//         // Find the user by the decoded token ID and exclude sensitive fields
//         const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

//         if (!user) {
//             throw new ApiError(401, "Invalid access token");
//         }

//         // Attach the user object to the request object
//         req.user = user;
//         next();
//     } catch (error) {
//         // Handle errors (e.g., jwt malformed or others)
//         console.error("JWT Error:", error);
//         throw new ApiError(401, error?.message || "Invalid access token");
//     }
// });

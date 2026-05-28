//used to upload files that are already being uploaded to the server , now needed to br uploaded to the cloud
import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import { ApiError } from "./apiError.js";
import { ApiResponse } from "./apiResponse.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null

    try {
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        await fs.promises.unlink(localFilePath).catch(() => { })
        return result
    } catch (error) {
        await fs.promises.unlink(localFilePath).catch(() => { })
        throw error
    }
}

const deleteCloudinaryFile = async (url) => {
    if (!url) {
        throw new ApiError(500,`No URL provided for unknown asset`);
        return null;
    }

    try {
        const getPublicIdFromUrl = (imgUrl) => {
            // Split at /upload/ to isolate the asset path
            const parts = imgUrl.split("/upload/");
            if (parts.length < 2) return null;

            return parts[1]
                .replace(/^v\d+\//, "") 
                .split(".")
                .slice(0, -1)
                .join(".");
        };

        const publicId = getPublicIdFromUrl(url);

        if (!publicId) {
            console.error(`Could not parse Cloudinary Public ID from URL: ${url}`);
            return null;
        }

        const result = await cloudinary.uploader.destroy(publicId);
        
        //  Cloudinary returns { result: 'not_found' } instead of throwing an error if ID is wrong
        if (result.result === 'not_found') {
            throw new ApiError(500, `Asset not found on Cloudinary. Public ID tried: ${publicId}`);
        }
        
        return result;
    } catch (error) {
        console.error("Cloudinary deletion error details:", error);
        throw new ApiError(500, `Error deleting file from Cloudinary: ${error.message || JSON.stringify(error)}`);
    }
};


export { uploadOnCloudinary, deleteCloudinaryFile }
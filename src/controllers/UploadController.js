const cloudinary = require("../utils/CloudinaryConfig");

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return res.status(500).json({
                message: "Cloudinary credentials are not configured"
            });
        }

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: process.env.CLOUDINARY_FOLDER || "vehiclevault"
                },
                (error, uploadResult) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(uploadResult);
                }
            );

            stream.end(req.file.buffer);
        });

        res.status(200).json({
            message: "Image uploaded successfully",
            data: {
                publicId: result.public_id,
                url: result.secure_url
            }
        });
    } catch (err) {
        res.status(500).json({
            message: "Error uploading image",
            error: err.message
        });
    }
};

module.exports = {
    uploadImage
};

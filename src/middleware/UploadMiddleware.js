const multer = require("multer")
const fs = require("fs")
const path = require("path")

const uploadDir = path.join(process.cwd(), "uploads")

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename:(req,file,cb)=>{
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        const extension = path.extname(file.originalname || "").toLowerCase()
        const baseName = path.basename(file.originalname || "image", extension)
        const safeBaseName = baseName
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_+|_+$/g, "") || "image"

        cb(null, `${uniqueSuffix}-${safeBaseName}${extension}`)
    }
})
const upload = multer({
    storage:storage,
})
module.exports = upload

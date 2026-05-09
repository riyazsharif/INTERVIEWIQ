// multer.js — add this fix

import multer from "multer"
import fs from "fs"           // ✅ add this

// ✅ Create the folder if it doesn't exist
if (!fs.existsSync("public")) {
  fs.mkdirSync("public", { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public")
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + "-" + file.originalname;
        cb(null, filename)
    }
})

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
});
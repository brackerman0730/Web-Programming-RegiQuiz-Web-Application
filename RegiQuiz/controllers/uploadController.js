const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

const storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: function(req, file, cb) {
        let ext = path.extname(file.originalname).toLowerCase();
        cb(null, crypto.randomBytes(16).toString('hex') + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function(req, file, cb) {
        cb(null, ALLOWED_MIME_TYPES.includes(file.mimetype));
    }
});

exports.uploadMiddleware = upload.single('image');

exports.requireLogin = function(req, res, next) {
    if (!req.session.userId) {
        res.status(401).send({ msg: 'You must be logged in to upload images' });
        return;
    }
    next();
};

exports.postCardImage = function(req, res) {
    if (!req.file) {
        res.status(400).send({ msg: 'No image uploaded, or the file type is not supported (PNG/JPEG/GIF/WEBP only).' });
        return;
    }

    res.status(201).send({ url: '/uploads/' + req.file.filename });
};

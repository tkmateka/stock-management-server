require('dotenv').config();

const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { MongoClient, GridFSBucket } = require('mongodb');

const mongoURI = process.env.MONGODB_CONNECTION;

let gridfsBucket;

MongoClient.connect(mongoURI)
    .then(client => {
        const db = client.db();
        gridfsBucket = new GridFSBucket(db, { bucketName: 'uploads' });
    })
    .catch(err => console.error('Failed to connect to MongoDB', err));

const gridFsStorage = {
    _handleFile: (req, file, cb) => {
        if (!gridfsBucket) return cb(new Error('GridFSBucket not initialized'), null);

        crypto.randomBytes(16, (err, buf) => {
            if (err) return cb(err);

            const filename = buf.toString('hex') + path.extname(file.originalname);
            const uploadStream = gridfsBucket.openUploadStream(filename,{
                contentType: file.mimetype // Set contentType here
            });

            uploadStream.once('finish', () => {
                cb(null, { filename: filename, id: uploadStream.id });
            });

            uploadStream.once('error', (err) => {
                cb(err, null);
            });

            file.stream.pipe(uploadStream);
        });
    },

    _removeFile: (req, file, cb) => {
        if (!gridfsBucket) return cb(new Error('GridFSBucket not initialized'), null);
        gridfsBucket.delete(file.id, cb);
    }
};

// Create multer instance
const upload = multer({
    storage: gridFsStorage,
    fileFilter: (req, file, cb) => {
        // Check if the file is an image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error('Only image files are allowed!'), false); // Reject the file
        }
    }
}).array('files'); // 'files' is the field name that will contain the files

module.exports = {
    upload
};

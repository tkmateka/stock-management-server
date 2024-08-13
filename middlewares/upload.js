require('dotenv').config();

const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

const mongoose = require('mongoose');
const conn = mongoose.createConnection(process.env.MONGODB_CONNECTION);

// Init gfs
let gfs;

conn.once('open', () => {
    // Initialize Stream
    gfs = Grid(conn.db, mongoose.mongo);
    // all set!
    gfs.collection('uploads');
});

// Create a Storage engine
const storage = new GridFsStorage({
    url: process.env.MONGODB_CONNECTION,
    file: (req, file) => {
        console.log(file);

        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
        console.log(filename);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
module.exports = {
    upload: multer({ storage })
}
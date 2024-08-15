require('dotenv').config();

const multer = require('multer');
const { MongoClient, GridFSBucket } = require('mongodb');
const crypto = require('crypto');
const path = require('path');

const mongoURI = process.env.MONGODB_CONNECTION;

let gridfsBucket;
let db;

MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db();
    gridfsBucket = new GridFSBucket(db, { bucketName: 'uploads' });
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));

const storage = multer.memoryStorage();

const handleFile = (req, file, cb) => {
  if (!gridfsBucket) return cb(new Error('GridFSBucket not initialized'), null);

  crypto.randomBytes(16, (err, buf) => {
    if (err) return cb(err);

    const filename = buf.toString('hex') + path.extname(file.originalname);
    const uploadStream = gridfsBucket.openUploadStream(filename);

    uploadStream.once('finish', () => {
      cb(null, { filename: filename, id: uploadStream.id });
    });

    uploadStream.once('error', (err) => {
      cb(err, null);
    });

    const readableStream = file.stream;
    readableStream.pipe(uploadStream);
  });
};

const uploadMiddleware = multer({ storage, fileFilter: (req, file, cb) => cb(null, true) });

module.exports = {
  upload: uploadMiddleware
};

require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { MongoClient, GridFSBucket } = require('mongodb');

// MongoDB connection URI
const mongoURI = process.env.MONGODB_CONNECTION;

// Create a memory storage engine for multer
const storage = multer.memoryStorage();

// Initialize GridFSBucket
let gridfsBucket;

// Connect to MongoDB
MongoClient.connect(mongoURI)
  .then(client => {
    const db = client.db();
    gridfsBucket = new GridFSBucket(db, { bucketName: 'uploads' });
    console.log('MongoDB connected and GridFSBucket initialized');
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Custom storage engine for GridFS
const gridFsStorage = {
  _handleFile: (req, file, cb) => {
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

      // Pipe file stream to GridFSBucket
      file.stream.pipe(uploadStream);
    });
  },

  _removeFile: (req, file, cb) => {
    gridfsBucket.delete(file.id, cb);
  }
};

// Configure multer with custom storage
const upload = multer({
  storage: gridFsStorage,
  fileFilter: (req, file, cb) => {
    // Allow all files
    cb(null, true);
  }
}).single('file'); // Use `.single('file')` if you're uploading a single file

module.exports = {
  upload
};

require('dotenv').config();

const Grid = require('gridfs-stream');

const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const conn = mongoose.createConnection(process.env.MONGODB_CONNECTION);

// Init gfs
let gfs, gridfsBucket;

conn.once('open', () => {
    // Initialize Stream
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
    gfs = Grid(conn.db, mongoose.mongo);
    // all set!
    gfs.collection('uploads');
});

module.exports = {
    upload_file: async (req, res) => {
        res.json({ file: req.files });
    },
    get_files: async (req, res) => {
        try {
            let files = await gfs.files.find().toArray();

            // If files exist
            return res.json(files);
        } catch (error) {
            res.status(400).json({ err });
        }
    },
    get_file_by_filename: async (req, res) => {
        try {
            let file = await gfs.files.findOne({ filename: req.params.filename });

            // Check if file exists
            if (!file || file.length === 0) {
                return res.status(404).json({
                    message: "No file found..."
                })
            }
            // Read output to browser
            const stream = gridfsBucket.openDownloadStream(file._id);
            stream.pipe(res);
        } catch (error) {
            res.status(400).json({ err });
        }
    },
    delete_file_by_id: async (req, res) => {
        try {
            const objectId = new ObjectId(req.params.id);

            let response = await gridfsBucket.delete(objectId);
            res.status(200).send({
                message: "File deleted successfully",
                response
            });
        } catch (error) {
            console.error(error); // Use console.error for logging errors
            return res.status(404).json({
                message: error.message || 'An error occurred'
            });
        }
    }
}
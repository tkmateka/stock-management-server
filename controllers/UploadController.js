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
        res.json({ file: req.file });
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
            // If file exist
            return res.json(file);
        } catch (error) {
            res.status(400).json({ err });
        }
    },
    get_image_by_filename: async (req, res) => {
        try {
            let file = await gfs.files.findOne({ filename: req.params.filename });

            // Check if file exists
            if (!file || file.length === 0) {
                return res.status(404).json({
                    message: "No file found..."
                })
            }
            // If this is an image
            if (file.contentType.includes('image')) {
                // Read output to browser
                const stream = gridfsBucket.openDownloadStream(file._id);
                stream.pipe(res);
            } else {
                return res.status(404).json({
                    message: "Not an image..."
                })
            }
        } catch (error) {
            res.status(400).json({ error });
        }
    },
    get_any_file_by_filename: async (req, res) => {
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
        gridfsBucket.delete(ObjectId(req.params.id), (err, gridStore) => {
            if (err) {
                console.log(err)
                return res.status(404).json({
                    message: err
                });
            }

            res.status(200).send({ message: "File deleted successfully" });
        });
    }
}
require('dotenv').config();
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

const mongoURI = process.env.MONGODB_CONNECTION;
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

let gridfsBucket;
conn.once('open', () => {
  gridfsBucket = new GridFSBucket(conn.db, { bucketName: 'uploads' });
});

module.exports = {
  upload_file: (req, res) => {
    res.json({ file: req.file });
  },

  get_files: (req, res) => {
    gridfsBucket.find().toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({ message: "No files found..." });
      }
      return res.json(files);
    });
  },

  get_file_by_filename: (req, res) => {
    gridfsBucket.find({ filename: req.params.filename }).toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({ message: "No file found..." });
      }
      return res.json(files[0]);
    });
  },

  get_image_by_filename: (req, res) => {
    gridfsBucket.find({ filename: req.params.filename }).toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({ message: "No file found..." });
      }

      const file = files[0];
      if (file.contentType.includes('image')) {
        const downloadStream = gridfsBucket.openDownloadStream(file._id);
        downloadStream.pipe(res);
      } else {
        return res.status(404).json({ message: "Not an image..." });
      }
    });
  },

  get_any_file_by_filename: (req, res) => {
    gridfsBucket.find({ filename: req.params.filename }).toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({ message: "No file found..." });
      }
      const file = files[0];
      const downloadStream = gridfsBucket.openDownloadStream(file._id);
      downloadStream.pipe(res);
    });
  },

  delete_file_by_id: (req, res) => {
    gridfsBucket.delete(ObjectId(req.params.id), (err) => {
      if (err) {
        console.log(err);
        return res.status(404).json({ message: err });
      }
      res.status(200).send({ message: "File deleted successfully" });
    });
  }
};

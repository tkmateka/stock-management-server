const mongoose = require('mongoose');

const Document = new mongoose.Schema({
    fileName: { type: String, required: true },
    fileDescription: { type: String, required: true },
    fileType: { type: String, required: true },
    dateUploaded: { type: Date, required: true, default: () => Date.now(), immutable: true },
});

module.exports = mongoose.model('Document', Document);
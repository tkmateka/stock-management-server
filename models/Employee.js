const mongoose = require('mongoose');

const Employee = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, index: { unique: true } },
    password: { type: String, required: false },
    role: { type: String, required: false },
    dateCreated: { type: Date, required: true, default: () => Date.now(), immutable: true },
    dateUpdated: { type: Date, required: false },
});

module.exports = mongoose.model('Employee', Employee);

// To set the value to an Object ID use this
// mongoose.SchemaTypes.ObjectId
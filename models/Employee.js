const mongoose = require('mongoose');

const Image = new mongoose.Schema({
    name: { type: String, required: false },
    path: { type: String, required: false }
})

const Employee = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, index: { unique: true } },
    password: { type: String, required: true },
    image: Image,
    dateCreated: { type: Date, required: true, default: () => Date.now(), immutable: true },
    dateUpdated: { type: Date, required: false },
});

module.exports = mongoose.model('Employee', Employee);

// To set the value to an Object ID use this
// mongoose.SchemaTypes.ObjectId
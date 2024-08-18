const mongoose = require('mongoose');

const Accessory = new mongoose.Schema({
    name: { type: String, required: false },
    description: { type: String, required: false },
})

const Image = new mongoose.Schema({
    name: { type: String, required: false },
    path: { type: String, required: false }
})

const Vehicle = new mongoose.Schema({
    regNo: { type: String, required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    modelYear: { type: Number, required: true },
    millage: { type: Number, required: true },
    colour: { type: String, required: true },
    vin: { type: String, required: true, uppercase: true, index: { unique: true } },
    retailPrice: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    accessories: [Accessory],
    images: [Image],
    dateCreated: { type: Date, required: true, default: () => Date.now(), immutable: true },
});

module.exports = mongoose.model('Vehicle', Vehicle);

// To set the value to an Object ID use this
// mongoose.SchemaTypes.ObjectId
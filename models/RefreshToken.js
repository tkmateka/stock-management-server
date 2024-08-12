const mongoose = require('mongoose');

const RefreshToken = new mongoose.Schema({
    token: { type: String, required: true, index: { unique: true } }
});

module.exports = mongoose.model('RefreshTokens', RefreshToken);
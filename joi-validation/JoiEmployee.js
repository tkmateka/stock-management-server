const Joi = require('joi');

const JoiEmployee = Joi.object({
    firstName: Joi.string().min(3).max(30).required(),
    lastName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    image: Joi.object(),
    dateCreated: Joi.date().min(new Date()),
    dateUpdated: Joi.date(),
});

module.exports = JoiEmployee
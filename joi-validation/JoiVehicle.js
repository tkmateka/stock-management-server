const Joi = require('joi');

const JoiEmployee = Joi.object({
    regNo: Joi.string().min(3).max(30).required(),
    make: Joi.string().min(2).max(30).required(),
    model: Joi.string().min(1).max(30).required(),
    modelYear: Joi.number().required(),
    millage: Joi.number().min(1).required(),
    colour: Joi.string().min(3).max(30).required(),
    vin: Joi.string().min(3).required(),
    retailPrice: Joi.number().required(),
    costPrice: Joi.number().required(),
    accessories: Joi.array().items(
        Joi.object()
    ),
    images: Joi.array().items(
        Joi.object()
    ).max(3),
});

module.exports = JoiEmployee
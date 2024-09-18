const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().min(12),
        image: Joi.any(),
        price: Joi.number().min(0).required(),
        country: Joi.string().required(),
        location: Joi.string().required(),
    }).required()
});


module.exports.reviewSchema = Joi.object({
    reviews: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().min(3).max(500).required()
    }).required(),
});

const express = require("express");
const { reviewSchema } = require("../joi.js");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require('../utils/ExpressError.js');
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, savedRedirectedUrl } = require("../middleware.js");
const router = express.Router({ mergeParams: true });



const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        console.log(errMsg);
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }

};


router.post("/", validateReview, isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    console.log(id);
    let listing = await Listing.findById(id);
    let newReview = await new Review(req.body.reviews);
    newReview.author = res.locals.currUser._id;
    const result = newReview.created_At = Date.now();
    console.log(result);
    listing.reviews.push(newReview);
    listing.save();
    newReview.save();
    console.log(listing.reviews);
    req.flash("success", "The Review is Created!");
    res.redirect(`/listings/${id}`);
}))

///delete reviews 
router.delete("/:reviewid", isLoggedIn, wrapAsync(async (req, res) => {
    let { id, reviewid } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
    await Review.findByIdAndDelete(reviewid);
    req.flash("success", "Review Deleted Successfully!");
    res.redirect(`/listings/${id}`);
}));


module.exports = router;
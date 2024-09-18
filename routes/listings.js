const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Listing = require("../models/listing.js");
const { listingSchema, reviewSchema } = require('../joi.js');
const { isLoggedIn, isOwner } = require("../middleware.js");
const multer = require('multer')
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage })


const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        console.log(errMsg);
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
};



//Index Route
router.get("/", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});

//New Route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id",
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id).populate({
            path: 'reviews',
            populate: {
                path: 'author',
                model: 'User'
            }
        }).populate('owner');
        if (!listing) {
            req.flash("error", "The Listing wasn't Found!");
            res.redirect("/listings");
        }
        res.render("listings/show.ejs", { listing });
    }));

//Create Route
router.post("/", isLoggedIn, upload.single('listing[image]'), wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.image = { url: req.file.path, filename: req.file.filename };
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));


//Edit Route
router.get("/:id/edit", isLoggedIn,
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        console.log(listing);
        if (!listing) {
            req.flash("error", "The Listing wasn't Found!");
            res.redirect("/listings");
        }
        res.render("listings/edit.ejs", { listing });
    }));

//Update Route
router.put("/:id",
    isOwner,
    validateListing,
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    }));

//Delete Route
router.delete("/:id", isLoggedIn,
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        await Listing.findByIdAndDelete(id);
        req.flash("success", "Succesfully Deleted");
        res.redirect("/listings");
    }));


module.exports = router;
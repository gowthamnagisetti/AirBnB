const Listing = require("./models/listing");


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        console.log(req.originalUrl);
        req.flash("error", "You have to logged in to use");
        res.redirect("/login");
    }
    next();
};

module.exports.savedRedirectedUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the Owner of Listing!");
        res.redirect(`/listings/${id}`);
    }
    next();
}
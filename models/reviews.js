const { date } = require('joi');
const mongoose = require('mongoose');
const listings = require("./listing");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const reviewSchema = {
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
    },
    created_At: {
        type: Date,
        default: Date.now(),
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}


const Review = new mongoose.model("Review", reviewSchema);

module.exports = Review;
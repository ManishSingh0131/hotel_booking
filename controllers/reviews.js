const Listing=require("../models/listing.js");
const Review=require("../models/review.js");

module.exports.createReview=async(req,res)=>{
    let{id}=req.params;
    let listing=await Listing.findById(id);
    let{rating,comment}=req.body;
    let newReview=new Review({
        comment:comment,
        rating:rating
    });
    newReview.createdBy=req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","New Review Created Successfully!");
    res.redirect(`/listings/${id}`);
};
module.exports.deleteReview=async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted Successfully!");
    res.redirect(`/listings/${id}`);
};
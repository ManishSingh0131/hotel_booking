const Listing=require("../models/listing.js");
module.exports.index=async(req,res)=>{
    const listingData= await Listing.find();
     res.render("index.ejs",{listingData});  
};

module.exports.renderNewForm=(req,res)=>{
    res.render("create.ejs");
};
module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const data =await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"createdBy",
        }
    })
    .populate("owner");
    if(!data){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("show.ejs",{data});
};
module.exports.createListing=async(req,res)=>{
    let url=req.file.path;
    let filename=req.file.filename;
    if(!req.body){
        throw new ExpressError(400,"Send Valid Data For Listing");
    }
        let{title,description,image,price,location,country}=req.body;
        let addListing=new Listing({
            title:title,
            description:description,
            image:image,
            price:price,
            location:location,
            country:country
        });
       addListing.owner=req.user._id;
       addListing.image= {url,filename};
       await addListing.save();
       req.flash("success","New Listing Created Successfully!");
       res.redirect("/listings");
};
module.exports.renderEditForm=async(req,res,)=>{
    let{id}=req.params;
    const data =await Listing.findById(id);
    if(!data){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl=data.image.url;
    originalImageUrl=originalImageUrl.replace("upload","/upload/h_300,w_250");
    res.render("edit.ejs",{data,originalImageUrl});
};
module.exports.updateListing=async(req,res,)=>{
    if(!req.body){
       throw new ExpressError(400,"Send Valid Data For Listing");
    }
   let{id}=req.params;
   let {title,description,image,price,location,country}=req.body;  
   let listing=await Listing.findByIdAndUpdate(id,{title:title,description:description,image:image,price:price,location:location,country:country});
  
   if(typeof req.file !=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image= {url,filename};
    await listing.save();
   };
   req.flash("success","Listing Updated Successfully!");
   res.redirect(`/listings/${id}`);
};
module.exports.deleteListing=async(req,res,)=>{
    let{id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted Successfully!");
    res.redirect("/listings");

};
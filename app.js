if(process.env.Node_ENV!=="production"){
    require('dotenv').config();
};

const express=require("express");
const app=express();
const mongoose=require("mongoose");
// const Listing=require("./models/listing.js");
// const Review=require("./models/review.js");
const path=require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended:true}));
const methodOverride=require("method-override");
app.use(methodOverride("_method"));
const ejsMade=require("ejs-mate");
app.engine('ejs',ejsMade);
app.use(express.static(path.join(__dirname,"/public")));
// const wrapAsync=require("./utils/wrapAsync.js");
// const ExpressError=require("./utils/expressError.js");
const listingRouter=require("./routes/listings.js");
const reviewRouter=require("./routes/reviews.js");
const userRouter=require("./routes/user.js");

const session=require("express-session");
const flash = require('connect-flash');
const passport=require("passport");
const LocalStatergy=require("passport-local");
const User=require("./models/user.js");
const sessionOption={
    secret:"this is my secretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
}
app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStatergy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

main().then((res)=>{
    console.log("connected");
})
.catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
};


// home route
// app.get("/",(req,res)=>{
//     res.send("hii i am root");
// });
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currentUser=req.user;
    next();
});
// app.get("/demouser",async(req,res)=>{
//     let fackeUser=new User({
//         email:"manish@gmail.com",
//         username:"manish",
//     });
//     let registerUser=await User.register(fackeUser,"manish");
//     res.send(registerUser);
// })
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});


//costom error handling middleware created
app.use((err,req,res,next)=>{
    let{status=500,message="Something wants wrong!"}=err;
    // res.status(status).send(message);
    // res.send("Something wants wrong");
    res.status(status).render("error.ejs",{message});
});

app.listen("1200",()=>{
    console.log("app is listening on port:1200");
});
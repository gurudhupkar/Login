//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyPaser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');



const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyPaser.urlencoded(
    {
        extended: true
    }
));

app.use(session({
    secret: "our Littile Secret",
    resave: false,
    saveUninitialized: false

}));
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb+srv://dhupkarguru:Guruk87210@cluster0.hyz26uo.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });


const userSchema = new mongoose.Schema(


    {
        email: String,
        password: String,
        googleId : String,
        secret : String 
    }

);
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);




const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.Client_ID,
    clientSecret: process.env.client_Secret,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    function (accessToken, refreshToken, profile, cb) {
        
        
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));



app.get("/", function (req, res) {
    res.render("home");
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ["profile"] }));

app.get('/auth/google/secrets',
    passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
        // Successful authentication, redirect to Secrets page.
        res.redirect("/secret");
    });

app.get("/login", function (req, res) {
    res.render("login");
});


app.get("/register", function (req, res) {
    res.render("Register");
});
app.get("/secret", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("Secrets");
    }
    else {
        res.redirect("/login");
    }
});

    app.get("/submit" ,function(req,res)
    {
        if (req.isAuthenticated()) {
            res.render("submit");
        }
        else {
            res.redirect("/login");
        }

    })

    app.post("/submit", function(req,res)
    {
        const UserSecrect=req.body.secret;

        console.log(req.user.id);

        User.findById(req.user.id, function(err,foundUser)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(foundUser)
                {
                    foundUser.secret=UserSecrect;
                    foundUser.save(function()
                    {
                        res.redirect("/secrets");
                    });
                }
            }
        });

    });

app.get("/logout", function (req, res) {
    req.logOut(function (err, user) {
        if (err) {
            console.log(err)
        }
        else {

            res.redirect("/")
        }
    });
})

app.post("/register", function (req, res) {
   
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");

        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secret");
            })

        }
    })



});

app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);

        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secret");
            })

        }

    });




})



app.listen(3000, function () {
    console.log("server stared on port 3000")
});

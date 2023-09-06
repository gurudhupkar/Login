//jshint esversion:6

require('dotenv').config();
const express= require ("express");
const bodyPaser= require("body-parser");
const ejs = require("ejs");
const mongoose =require("mongoose");
const encrypt=require("mongoose-encryption");


const app= express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyPaser.urlencoded(
    {
        extended: true
    }
));

    mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser:true});


    const userSchema= new mongoose.Schema(


        {
            email:String,
            password : String
    
        }

    );

   
    userSchema.plugin(encrypt,{secret: process.env.SECRET , encryptedFields:['password']})

    const user=new mongoose.model("User", userSchema)

    app.get("/", function(req,res)
    {
        res.render("home");
    });


    app.get("/login", function(req,res)
    {
        res.render("login");
    });


    app.get("/register", function(req,res)
    {
        res.render("Register");
    });

    app.post("/register",function(req,res)
    {
        const newUser= new user({

            email:req.body.username,
            password:req.body.password

        });
        newUser.save()
        .then(function()
        {
            res.render("secrets");
        }

        )
        .catch(function(err)
        {
            console.log(err);
        })
      
    });

    app.post("/login" , function(req,res)
    {
        const username=req.body.username;
        const password= req.body.password;

        // user.findOne({emial:username}, function(err,FoundUser)
        // {
        //     if(err)
        //     {
        //         console.log(err);
        //     }
        //     else{
        //         if(FoundUser)
        //         {
        //             if(FoundUser.password== password)
        //             {
        //                 res.render("Secrets")
        //             }
        //         }
        //     }
        // })
        user.findOne({email: username})
        .then(function (foundUser){
            if(foundUser){
                if(foundUser.password == password){
                    res.render("Secrets")
                }
                else{
                    res.send("Passwowrd is wrong")
                }
            }
            else{
                res.send("Email is wrong")
            }

        })
        .catch(function (err){
            console.log(err);
        })


    
    })


  
    app.listen(3000 ,function()
    {
        console.log("server stared on port 3000")
    });

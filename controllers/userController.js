
//importing user model
const User=require('./../models/userModel.js');
const jwt=require('jsonwebtoken');



//creating user ---- sign up
const signUp=async(req,res) => {
//we should save the data in db first then generate token as while signup we automatically logged in
console.log(req.body);
try{
    //before saving the password we should encrypt it so create a pre save middleware in model
    const newUser=await User.create(req.body)
    console.log(process.env.SECRET);
    //now after saving and encryption generate json web token
    const token=jwt.sign({id:newUser._id},process.env.SECRET,{expiresIn:process.env.expires});
    //sending token to user with response
    res.status(201).json({
        status:"Success",
        data:{
            user:newUser,
            token
        }
    })

}
catch(err){
    res.status(400).json({
        status:"fail",
        error:err.message,
        message:"something went wrong try again later"
    })
}

}
//logging in
const login=async(req,res) => {
   //1.check if user entered both email and password
   try{
   if(!req.body.email || !req.body.password){
       throw new Error("Please enter email and password");
   }
   //2 check is user exist in database
   const checkUser=await User.findOne({email:req.body.email});
   //if find user match for password use mongoose instance method in model
   if(!checkUser || ! await checkUser.checkPassword(req.body.password,checkUser.password)){
       throw new Error("please enter valid email or password");
   }
   //3.now if both user and password matched with db generate token and send to client
   const token=jwt.sign({
       id:checkUser._id
   },process.env.SECRET,{expiresIn:process.env.expires});
   res.status(200).json({
       status:"success",
       message:"you are successfully logged in",
       token
   })

}
  catch(err){
   res.status(400).json({
       status:"fail",
       message:err.message
   })
  }
}
//protecting the route to only logged in users
const protect=async (req,res,next) => {
    try{
       
    //1.check if we got the token along with header
    if(!req.headers.authorization && ! req.header.authorization.startsWith("Bearer")){
        throw new Error("unathorised accesss");
    }
    const token=req.headers.authorization.split(" ")[1];
  
    //2.now if we got the token verify if it is correct or not
    const decodeToken=jwt.verify(token,process.env.SECRET);
    //3.check if user still exist ie the token belong to user still exist
    const checkUser=await User.findById(decodeToken.id);
    if(!checkUser){
        throw new Error("User does not exist")
    }
    //4.check if the token which is sent still not expires
    const checkToken=checkUser.checkTokenExpired(decodeToken.iat);
    if(checkToken){
        throw new Error("Token expired please log in again")
    }
    //assigning current user so that we can use it later which is current logged in usr
    req.user=checkUser;
    next();
}
    catch(err){
        res.status(400).json({
            status:"fail",
            message:err.message
        })
    }
}
//getting all the users
const getAllUsers=async(req,res,next) =>{
  try{
      const users=await User.find();
      res.status(200).json({
          status:"success",
          result:users.length,
          data:{
              users
          }
      })
  }
  catch(err){
      res.status(404).json({
          status:"fail",
          message:err.message
      });
  }
}
//update password
const updatePassword=async(req,res,next) => {

  try{

  const user=await User.findById(req.user._id);
  
  //for double check ask for its current password
  const correctPassword=await user.checkPassword(req.body.currentPassword,user.password);
  if(!correctPassword){
      throw new Error("please enter correct password")
  }
  user.password=req.body.password;
  user.confirmPassword=req.body.confirmPassword;
  //before saving the set changedPassword At to current times
  await user.save();
  res.status(202).json({
      status:"success",
      data:{
          user
      }
  })
    }


 catch(err){
     res.status(400).json({
         status:"fail",
         message:err.message
     })

}
}


exports.signup=signUp;
exports.login=login;
exports.getAllUsers=getAllUsers;
exports.protect=protect;
exports.updatePassword=updatePassword;
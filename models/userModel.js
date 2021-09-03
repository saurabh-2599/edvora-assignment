const mongoose=require('mongoose');
//custom validator
const validator=require('validator');
const bcrypt=require('bcryptjs');
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,"user should have email"],
        unique:true,
        //validating if email entered is valid or not
        validate:[validator.isEmail,"Please enter valid email address"]
    },
    password:{
        type:String,
        minlength:8,
        required:[true,"Please enter password"],
        //remove spaces from beginning and last
        trim:true
    },
    confirmPassword:{
        type:String,
        required:[true,"please confirm your password"],
        //check if confirmpassword matched with password then only move otherwise validation ertor
        validate:{
            validator:function(el){
                return el===this.password;//this points to current document
            },
            message:"Both password and confirm password should match"
        }
    },
    changedPasswordAt:{
        type:Date,
    }
    }
);
//pre middleware
userSchema.pre('save',function(next){
 if(!this.isModified('password') || this.isNew){
     return next();
 }
 this.changedPasswordAt=Date.now();//current time
 next();
})
userSchema.pre('save',async function(next){
  if(!this.isModified('password')){
      //since we will use both .save for creation and update in case where user doesnt update password it should move to next middleware
      return next();
  }
  this.password=await bcrypt.hash(this.password,10);
  this.confirmPassword=undefined;
  next();

})
//mongoose instance method for comparing the password for login
userSchema.methods.checkPassword=async function(candidatePwd,dbPwd){
    return await bcrypt.compare(candidatePwd,dbPwd);
}
////mongoose instance method for checking if token not expired
userSchema.methods.checkTokenExpired=function(timeOfCreation){
    if(this.changedPasswordAt){
        //so if token expired true will be returned otherwise false;
        const timeOfChange=this.changedPasswordAt.getTime()/1000;
        return timeOfChange>timeOfCreation;
    }
    //if no passwordchangedAt property return false;
    return false;
}
//creating model out of schema
const User=new mongoose.model('User',userSchema);
//exporting the model to work with the model
module.exports=User;
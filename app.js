const userRouter=require('./route/userRoute.js');
const express=require('express');
const morgan=require('morgan');
//creating server
const app=express();
//use body parser middleware
app.use(express.json());
app.use(morgan('dev'));
app.use('/edvora/users',userRouter);
module.exports=app;
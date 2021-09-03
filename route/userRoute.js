const userController=require('./../controllers/userController.js');
const express=require('express');
const router=express.Router();
router.post('/signup',userController.signup)
router.post('/login',userController.login);
router.get('/',userController.protect,userController.getAllUsers);
router.patch('/updatePassword',userController.protect,userController.updatePassword);
module.exports=router;
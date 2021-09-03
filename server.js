const dotenv=require('dotenv');
dotenv.config({
    path:'./config.env'
});
const mongoose=require('mongoose')
const app=require('./app');
console.log(process.env.DB);
mongoose.connect(process.env.DB,{useNewUrlParser:true}).then(() => console.log("database successfully connected")).catch(err => console.log(err));

app.listen(8000,() => {
    console.log("server has been started on port 8000")}
    );
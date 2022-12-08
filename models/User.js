const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        require:true,
        unique:true
        },
    password:{
        type:String,
        require:true
    }
},{timestamps:true});
exports.module = new mongoose.model("User", userSchema);
exports.module.userSchema = userSchema;
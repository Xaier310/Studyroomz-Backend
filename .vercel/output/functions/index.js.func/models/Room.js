const mongoose = require("mongoose");
const {msgSchema} = require("./Msg");

const roomSchema = new mongoose.Schema({
users:[{type: String}],
roomId:{
    type:String,
    require:true,
    unique:true
},
msgs:[msgSchema],
},{ timestamps: true });

module.exports.roomSchema = roomSchema;
module.exports = new mongoose.model("Room", roomSchema);

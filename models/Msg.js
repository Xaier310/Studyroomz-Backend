const mongoose = require("mongoose");
const msgSchema = new mongoose.Schema({
    username:{
        type: String,
    },
    msg:{
        type:String,
    },
    time:{
        type:String,
    },
    roomId:{
        type:String
    },
    _time:{
        type:String
    },
    name:{
        type:String
    }
    // msg, roomId, time, username, _time, name
});

module.exports = new mongoose.model("Msg", msgSchema);
module.exports.msgSchema = msgSchema;
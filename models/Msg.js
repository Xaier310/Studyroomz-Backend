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
    nickname:{
        type:String
    }
    // msg, roomId, time, username, _time, nickname
});

module.exports = new mongoose.model("Msg", msgSchema);
module.exports.msgSchema = msgSchema;
const router = require("express").Router();
const Room = require("../models/Room");
const Msg = require("../models/Msg")

router.get("/",async (req,res)=>{
    try{
        var data = req.body;
        var room = await Room.find({roomId:data.roomId});
        if(room.length !== 0){
            console.log("dshb :",room[0].msgs);
            res.status(200).json(room[0].msgs);
        }else{
            res.status(404).json("room not found");
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;
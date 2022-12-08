const router = require("express").Router();
const Room = require("../models/Room");

router.post("/", async (req,res)=>{
    try{
        var newRoom = new Room(req.body); 
        var room = await Room.findOne({roomId:req.body.roomId});
        if(!room){
            var result = await newRoom.save();
            res.status(200).json(result);
        }else{
         res.status(403).json("Room id already exist");
        }
    }
    catch(err){
        res.status(500).json(err);
        console.log(err);
    }
});
router.get("/", async (req,res)=>{
    try{
       var rooms = await Room.find();
       res.status(200).json(rooms);
    }catch(err){
        res.status(500).json(err);
        console.log(err);
    }
});

module.exports = router;
const router = require("express").Router();
const Room = require("../models/Room");
const Msg = require("../models/Msg")

router.post("/addusers",async (req,res)=>{
    try{
        var data = req.body;
        var room = await Room.findOne({roomId:data.roomId});
        if(room){
            var flag = true;
            for(var i=0;i<room.users.length;i++){
                if(room.users[i] === data.username){
                    flag = false;
                    break;
                }
            }
            if(flag){
                await Room.updateOne({roomId:data.roomId},{
                    $push:{users:data.username}
                });
                res.status(200).json("User added succesfully");
            }
            else{
                res.status(403).json("user already joined room");
            }
        }
        else{
            res.status(404).json("room not found");
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json(err);
    }
});

router.post("/addmsgs",async (req,res)=>{
    try{
        var data = req.body;
        var room = await Room.findOne({roomId:data.roomId});
        if(room){
            var msg = new Msg({
                msg:data.msg,
                time:data.time,
                username:data.username
            });
        await Room.updateOne({roomId:data.roomId},{
            $push:{msgs:msg}
        });
        res.status(200).json("Msg added succesfully");
        }
        else{
            res.status(404).json("room not found");
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;
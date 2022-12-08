const router = require("express").Router();
const {db} = require("../index");

router.get("/",(req,res)=>{
  var roomid = req.body.roomid;
  var curTime = new Date();
  db.query(
      `SELECT * FROM ROOM 
      WHERE roomid = ${roomid}
      ORDER BY _time
      `
  )
});

router.post("/",(req,res)=>{
    // var msgObj={
    //     msg : req.body.msg,
    //     username : req.body.username,
    //     _time : req.body._time,
    //     roomid : req.body.roomid,
    // }
    console.log("post has ran...");
    db.query(
      "INSERT INTO room (msg, roomid, _time, username, created_At) VALUES (?,?,?,?,?)",[req.body.msg,req.body.roomid,req.body._time,req.body.username,req.body.created_At],
      (err, result)=>{
           if(err) console.log(err);
           else console.log("Msg inserted");
      }
    );
});

module.exports = router;

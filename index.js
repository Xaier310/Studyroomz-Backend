const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();
const roomRoute = require("./routes/rooms");
const makeChangesRoute = require("./routes/makechanges");
const fetchAllMsgsRoute = require("./routes/fetchmsgs");
const Msg = require("./models/Msg");
const { addUser, removeUser, getUser, getUsersInRoom, isRoomValid } = require("./users");
const axios = require("axios");


const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));


const backendServer = app.listen(PORT, () => {
  try {
    console.log(`Backend server is running on port ${PORT}`);
  } catch (err) {
    console.log(err);
  }
});

mongoose.connect(
  `${process.env.MONGO_DB_LINK}`,
  (err) => {
    if (err) throw err;
    console.log("MONGODB Connected Successfully");
  }
);

app.use("/api/fetchallmsgs", fetchAllMsgsRoute);
app.use("/api/rooms", roomRoute);
app.use("/api/makechanges", makeChangesRoute);


const io = new Server(backendServer, {cors: { origin: "*"}});


app.get("/",(req,res)=>{
  res.send("Backend is up and running");
})





/*************************** socket emits and catch ************** */

io.on("connection", (socket) => {
    // var rooms = io.sockets.adapter.rooms;
    io.emit("welcome", "Hello this is a chat app");

    socket.on("join_room", function ({ userInfo, roomId, isOldRoom }, callback) {
      if (typeof callback !== "function") return;    
      if(isOldRoom && !isRoomValid({roomId})) callback({error:"Invalid Room Id"});
      const { error, user } = addUser({ socketid:socket.id, roomId, userInfo });
      if(error) return callback({error});
      socket.join(roomId);
      const arr = getUsersInRoom({roomId})
      console.log("litsen join room...", userInfo.nickname);
      io.to(roomId).emit("give_room_users", {users:arr});
      callback({error:undefined});
    });
  
    socket.on("send_message", (msg) => {
      console.log("msg recieved...",msg.roomId);
      io.to(msg.roomId).emit("receive_message", msg);
    });
  
    socket.on("custom_stats_no", ({roomStr, roomsPerTopic}) => {
      var length = [];
      for (let i = 0; i < roomsPerTopic; i++) {
        const roomId = `${roomStr}${i + 1}`;
        const usersInRoom = getUsersInRoom({roomId});
        length.push(usersInRoom.length);
      }
      socket.emit("custom_stats_no", length);
    });
  
    socket.on("give_room_users", ({roomId}) => {
      const arr = getUsersInRoom({roomId})
      socket.emit("give_room_users", {users:arr});
    });
  
    socket.on("remove_me", (roomId) => {
      console.log("removed...");
      removeUser({socketid:socket.id});
      const arr = getUsersInRoom({roomId});
      if(arr.length === 0 && !roomId.includes("webroom") && !roomId.includes("androidroom") && !roomId.includes("mlroom")){ 
        axios.delete(`${process.env.BACKEND_API}api/studyroomz`,{ params: { roomid:roomId } }).
        then((res)=>{
          console.log("Rooms msgs deleted from room",roomId);
        }).catch((err)=>{
          console.log("err : ",err);
        })
      }
      else socket.to(roomId).emit("give_room_users", {users:arr});
    });

  socket.on("disconnect", () => {
    const user = getUser({socketid:socket.id})
    if(!user || !user.roomId) return;
    const roomId = user.roomId;
    removeUser({socketid:socket.id});
    const arr = getUsersInRoom({roomId:roomId});
    if(arr.length === 0 && !roomId.includes("webroom") && !roomId.includes("androidroom") && !roomId.includes("mlroom")){ 
      // axios.delete(`${process.env.BACKEND_API}api/studyroomz`,{ params: { roomid:roomId } }).
      // then((res)=>{
      //   console.log("Rooms msgs deleted from room",roomId);
      // }).catch((err)=>{
      //   console.log("err : ",err);
      // })
    }
    else socket.to(roomId).emit("give_room_user", {users:arr});
  });
  
  /*******************TEST STUFF **********************/
  // socket.on("emit test",(roomId)=>{
  //   console.log("emit test", roomId, isRoomValid({roomId}));
  //   io.to(roomId).emit("test");
  // });

});


//socket.to or socket.broadcast.to => itself will not trigger
//io.to => all will trigger 



/******************Routes ******************/

app.get("/api/allmsg",async (req,res)=>{
  Msg.find({},(err,docs)=>{
    if(err) console.log(err);
    else res.send(docs);
  });
});

app.get("/api/studyroomz",async (req,res)=>{
  var roomid = req?.query?.roomid;
  if(roomid){
    Msg.find({roomId:roomid},(err,docs)=>{
      if(err) console.log(err);
      else res.send(docs);
    });
  }
});

app.post("/api/studyroomz",(req,res)=>{
  var msgs = new Msg(req.body);
  msgs.save();
});

app.delete("/api/studyroomz",(req,res)=>{
  var roomid = req?.query?.roomid;
  if(roomid){
    Msg.deleteMany({roomId:roomid},(err, resp)=>{
      if(err) console.log("err");
      else{
        console.log(res);
        res.status(200).send("successfully deleted");
      }
    });
  }
});



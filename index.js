const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const server = http.createServer(app);
const mysqlRoute = require("./routes/mysql");
const roomRoute = require("./routes/rooms");
const makeChangesRoute = require("./routes/makechanges");
const fetchAllMsgsRoute = require("./routes/fetchmsgs");
const { instrument } = require("@socket.io/admin-ui");
const mysql = require('mysql');
const { msgSchema } = require("./models/Msg");
const Msg = require("./models/Msg");
const fs = require("fs");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));


mongoose.connect(
  `${process.env.MONGO_DB_LINK}`,
  // `mongodb://localhost:27017/ChatBot`,
  (err) => {
    if (err) throw err;
    console.log("MONGODB Connected Successfully");
  }
);

app.use("/api/fetchallmsgs", fetchAllMsgsRoute);
app.use("/api/rooms", roomRoute);
app.use("/api/makechanges", makeChangesRoute);

function randomStr() {
  var ans = "";
  const arr = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (var i = 6; i > 0; i--) {
    ans += arr[Math.floor(Math.random() * arr.length)];
  }
  var f = Date.now();
  return ans+f;
}

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://admin.socket.io/",
      `${process.env.FRONTEND_API}`,
    ],
    methods: ["GET", "POST"],
  },
});

// const io = new Server(5000);

const PORT = process.env.PORT || 3001;


instrument(io,{
  auth: false,
});


server.listen(PORT, () => {
  try {
    console.log(`Backend server is running on port ${PORT}`);
  } catch (err) {
    console.log(err);
  }
});
app.get("/",(req,res)=>{
  res.send("Backend is up and running");
})

var users = [];
const roomsPerTopic = 10;

const addUser = (user, socketid) => {
  if(!users.some((usr) => usr.socketid === socketid)){
    users.push({ user, socketid });
  }
};

const removeUser = (socketid) => {
  users = users.filter((user) => user.socketid !== socketid);
};

io.on("connection", (socket) => {

  var rooms = io.sockets.adapter.rooms;
  io.in(socket.id).socketsLeave(socket.id);
  io.emit("welcome", "Hello this is a chat app");

  socket.on("addUser", (username) => {
    addUser(username, socket.id);
  });

  socket.on("join_room", async (obj) => {
    if (obj.type === "oldRoom") {
      if (rooms.has(obj.roomId)) {
        if (!rooms.get(obj.roomId).has(socket.io)) {
          await socket.join(obj.roomId);
          socket.roomId = obj.roomId;
          socket.emit("isJoined", true);
        }
      } 
    else {
        console.log("Room id is not valid");
        socket.emit("isJoined", false);
      }
    } else if (obj.type === "newRoom") {
        await socket.join(obj.roomId);
        socket.roomId = obj.roomId;
    }
  });

  socket.on("join_custom_room", async (roomId) => {
    if (rooms.has(roomId)) {
      if (!rooms.get(roomId).has(socket.id)) {
        await socket.join(roomId);
        socket.roomId = roomId;
        // socket.emit("isJoined", true);
      }
    } else {
      await socket.join(roomId);
      socket.roomId = roomId;
      // socket.emit("isJoined", true);
    }
  });

  socket.on("send_message", (msg) => {
    console.log("msg recieved...",msg.roomId);
    socket.to(msg.roomId).emit("receive_message", msg);
  });

  socket.on("custom_stats", (roomStr) => {
    var length = [];
    for (let i = 0; i < roomsPerTopic; i++) {
      if (rooms.get(`${roomStr}${i + 1}`))
        length.push(rooms.get(`${roomStr}${i + 1}`).size);
      else length.push(0);
    }
    socket.emit("your_custom_stats", length);
  });

  socket.on("give_roomUsers", (roomId) => {
    var arr = [];
    if (rooms.has(roomId)) {
      arr = Array.from(rooms.get(roomId));
    }
    io.in(roomId).emit("get_roomUsers", arr);
  });

  socket.on("remove_me", (roomId) => {
    if (roomId) {
      if (rooms.has(roomId)) {
        if (rooms.get(roomId).has(socket.id)) {
          io.in(roomId).socketsLeave(socket.id);
        }
      }
      removeUser(socket.id);
      if (socket.roomId) {
        socket.to(socket.roomId).emit("getUsers", users);
      }
    }
  });

  socket.on("giveUsers", (roomId) => {
    socket.to(roomId).emit("getUsers", users);
    console.log("Users connected : ", users.length);
  });


  socket.on("disconnect", () => {
    removeUser(socket.id);
    if (socket.roomId) {
      socket.to(socket.roomId).emit("getUsers", users);
    }
  });

  
  socket.on("upload",({data})=>{
    console.log("upload...",data);
    // fs.writeFile("upload/" + "test.png", data, {encoding: "base64"},()=>{
    // })
    // socket.emit("uploaded",{buffer: data.toString("base64")});
    // console.log(data);
  })
});

app.get("/api/allmsg",async (req,res)=>{
  Msg.find({},(err,docs)=>{
    if(err) console.log(err);
    else res.send(docs);
  });
});

app.get("/api/studyroomz",async (req,res)=>{
  var roomid = req.query.roomid;
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



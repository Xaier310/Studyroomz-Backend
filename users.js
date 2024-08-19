const users = [];

const addUser = ({ socketid, userInfo, roomId }) => {

  const existingUser = users.some((user) => user.roomId === roomId && user.userInfo.email === userInfo.email);
  // console.log("existing ", existingUser);
  
  if(!socketid || !roomId || !userInfo) return { error: 'User must be authenticated' };
  if(existingUser) return { error: 'Already exists in that roomId' };
  
  const user = { socketid, userInfo, roomId };
  users.push(user);
  return { user };
}

const removeUser = ({ socketid }) => {
  const index = users.findIndex((user) => user.socketid === socketid);
  if(index !== -1) return users.splice(index, 1)[0];
}

const getUser = ({ socketid }) => users.find((user) => user.socketid === socketid);

const getUsersInRoom = ({ roomId }) => {
  const arr = [];
  for(const user of users){
    if(user.roomId === roomId) arr.push(user.userInfo);
  }
  return arr;
}

const isRoomValid = ({ roomId }) => {
  const flag = users.some((user) => user.roomId === roomId);
  return flag;
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom, isRoomValid };

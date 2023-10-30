var http = require('http');
var server = http.createServer();
var rooms = {} // data storage 

var io = require("socket.io")(server, {
    cors: {
        origin: "*"
      } 
});

var clients = 0
 
io.on("connection", function(socket) {
    clients++
    var roomName = null
    io.sockets.emit("broadcast", clients)

    socket.on('disconnect', function () {
        clients--;

        // get total member room
        var memberCount = io.sockets.adapter.rooms.get(roomName)?.size
        //push to spesific room to update total online user
        socket.to(roomName).emit("memberCount", memberCount)

        //update data storage
        rooms[roomName] = memberCount

        //send broadcast to all client
        // to do reinit data / update data
        io.sockets.emit('broadcast',clients);
      
    });

    socket.on("joinRoom",(room, userId)=>{
        socket.join(room)
        roomName = room

        // get total member on room
        var memberCount = io.sockets.adapter.rooms.get(room)?.size
        //global push to room member 
        socket.to(room).emit("memberCount", memberCount)
        // socket.to(room).emit("msgFromRoom", `user ${userId} bergabung room ${room} ${memberCount}`)
        rooms[room] = memberCount

        //push total online user to current user on load / refresh
        io.to(userId).emit("memberCount", memberCount)
        // emit member count 
      io.sockets.emit('broadcast',clients);

    })

    socket.on('leaveRoom', (room) => {
        socket.leave(room);

        // get total member on room
        var memberCount = io.sockets.adapter.rooms.get(room)?.size
        rooms[room] = memberCount

        //global push to room member 
        socket.to(room).emit("memberCount", memberCount)
      io.sockets.emit('broadcast',clients);
      console.log(memberCount)
    });

    socket.on("getRoomInfo",  (elIndex,room) => {
        // console.log("get info")
        socket.emit("roomInfo", rooms[room], elIndex)
    })

    
    // console.log(rooms)
});

server.listen(process.env.PORT , function(){
  console.log("server run")
});
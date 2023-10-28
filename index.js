var http = require('http');
var server = http.createServer();
var rooms = {}

var io = require("socket.io")(server, {
    wsEngine: require("eiows").Server,
    perMessageDeflate: {
        threshold: 32768
    },
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
        io.sockets.emit('broadcast',clients);

        // get total member on room
        var memberCount = io.sockets.adapter.rooms.get(roomName)?.size
        //global push to room member 
        socket.to(roomName).emit("memberCount", memberCount)
    });

    socket.on("joinRoom",(room, userId)=>{
        socket.join(room)
        roomName = room

        // get total member on room
        var memberCount = io.sockets.adapter.rooms.get(room)?.size
        //global push to room member 
        socket.to(room).emit("memberCount", memberCount)
        socket.to(room).emit("msgFromRoom", `user ${userId} bergabung room ${room} ${memberCount}`)
        rooms[room] = memberCount

        //push total online user to current user on load / refresh
        io.to(userId).emit("memberCount", memberCount)
        // emit member count 

    })

    socket.on('leaveRoom', (room) => {
        socket.leave(room);

        // get total member on room
        var memberCount = io.sockets.adapter.rooms.get(room)?.size
        rooms[room] = memberCount

        //global push to room member 
        socket.to(room).emit("memberCount", memberCount)
    });

    socket.on("getRoomInfo",  (elIndex,room) => {
        // console.log("get info")
        console.log(elIndex, room)
        socket.emit("roomInfo", rooms[room], elIndex)
    })

    
    // console.log(rooms)
});

server.listen(8080);
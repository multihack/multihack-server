var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var cfenv = require('cfenv')
var signal = require('simple-signal-server')(io)

io.on('connection', function (socket) {  
  socket.on('join', function (data) {
    if (!data.room) return
    socket.join(data.room)
    socket.room = data.room
  })
  
  socket.on('forward', function (data) {
    socket.broadcast.to(socket.room).emit('forward', data)
  })
})

app.get('/', function (req, res) {
  res.send('Multihack Server')
})

signal.on('discover', function (request) {
  if (!request.metadata.room) return
  var room = io.sockets.adapter.rooms[request.metadata.room]
  var peerIDs = room ? Object.keys(room.sockets) : []
  request.discover(peerIDs)
})

var appEnv = cfenv.getAppEnv()
server.listen(appEnv.port)
console.log('Running at '+appEnv.url)
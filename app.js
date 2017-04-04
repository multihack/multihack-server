var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var cfenv = require('cfenv')
var signal = require('simple-signal-server')(io)
var path = require('path')

app.use('/', express.static(path.join(__dirname, 'multihack-web')))
app.get('/', function (req, res, next) {
  res.sendFile(__dirname + '/multihack-web/index.html')
})

var calls = {}

io.on('connection', function (socket) {  
  socket.on('join', function (data) {
    if (!data.room) return
    socket.join(data.room)
    socket.room = data.room
  })
  
  socket.on('forward', function (data) {
    socket.broadcast.to(socket.room).emit('forward', data)
  })
  
  socket.on('voice-join', function () {
    calls[socket.room] = calls[socket.room] || []
    calls[socket.room].push(socket.id)
  })
  
  socket.on('voice-leave', function () {
    calls[socket.room] = calls[socket.room] || []
    var index = calls[socket.room].indexOf(socket.id)
    calls[socket.room].splice(index,1)
  })
  
  socket.on('disconnect', function () {
    calls[socket.room] = calls[socket.room] || []
    var index = calls[socket.room].indexOf(socket.id)
    calls[socket.room].splice(index,1)
  })
})

app.get('/', function (req, res) {
  res.send('Multihack Server')
})

signal.on('discover', function (request) {
  if (!request.metadata.room) return
  var peerIDs = calls[request.metadata.room] || []
  request.discover(peerIDs)
})

var appEnv = cfenv.getAppEnv()
server.listen(appEnv.port)
console.log('Running at '+appEnv.url)
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
var rooms = {}

io.on('connection', function (socket) {  
  socket.on('join', function (data) {
    if (!data.room) return
    
    socket.join(data.room)
    socket.room = data.room
    
    rooms[socket.room] = rooms[socket.room] || []
    rooms[socket.room].push(socket.id)
    
    socket.emit('join')
  })
  
  socket.on('voice-join', function () {
    if (!socket.room) return
    
    socket.emit('voice-discover', calls[socket.room] || [])
    
    calls[socket.room] = calls[socket.room] || []
    calls[socket.room].push(socket.id)
  })
  
  socket.on('voice-leave', function () {
    if (!socket.room) return
    
    calls[socket.room] = calls[socket.room] || []
    var index = calls[socket.room].indexOf(socket.id)
    if (index !== -1) calls[socket.room].splice(index, 1)
  })
  
  socket.on('disconnect', function () {
    if (!socket.room) return
    
    calls[socket.room] = calls[socket.room] || []
    var index = calls[socket.room].indexOf(socket.id)
    if (index !== -1) calls[socket.room].splice(index, 1)
    
    rooms[socket.room] = rooms[socket.room] || []
    index = rooms[socket.room].indexOf(socket.id)
    if (index !== -1) rooms[socket.room].splice(index, 1) 
  })
})

signal.on('discover', function (request) {
  if (!request.metadata.room) return
  
  var peerIDs = rooms[request.metadata.room] || [] // TODO: Loose mesh
  request.discover(peerIDs)
})

signal.on('request', function (request) {
  request.forward()
})

var appEnv = cfenv.getAppEnv()
server.listen(appEnv.port)
console.log('Running at '+appEnv.url)
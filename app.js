var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var cfenv = require('cfenv')

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

var appEnv = cfenv.getAppEnv()
server.listen(3000)
console.log('Running at '+appEnv.url)
var io = require('socket.io')()
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


var appEnv = cfenv.getAppEnv();
io.listen(appEnv.port)
console.log('Running at '+appEnv.url)
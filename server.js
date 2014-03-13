
exports.install = function(self, args)
{
  if(!args) args = {};
  var io = require("socket.io").listen(args.port||0, {log:false});
  self.pathSet({type:"http","http":"http://"+io.server.address().address+":"+io.server.address().port});

  io.on("connection", function(socket){
    socket.on("packet", function(packet) {
      if(!packet.data) return;
      self.receive((new Buffer(packet.data, "base64")).toString("binary"), {type:"local", id:socket.id});
    });
  });
  self.deliver("local",function(to,msg){
    var buf = Buffer.isBuffer(msg) ? msg : new Buffer(msg, "binary");
    if(io.sockets.sockets[to.id])
    {
      io.sockets.sockets[to.id].emit("packet", {data: buf.toString("base64")});
    }
  });
}


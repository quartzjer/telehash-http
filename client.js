exports.name = 'http-client';
var io = require("socket.io-client");

exports.mesh = function(mesh, cbMesh)
{
  var sockets = {};
  mesh.deliver("http", function(path, msg, to) {
    if(!sockets[path.http]){
      sockets[path.http] = io.connect(path.http);
      sockets[path.http].on("packet", function(packet){
        self.receive((new Buffer(packet.data, "base64")).toString("binary"), path);
      });
    }
    sockets[path.http].emit("packet", {data: msg.toString("base64")});
  });  
  cbMesh();
}


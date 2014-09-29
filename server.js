exports.name = 'http-server';
var io = require('socket.io');

exports.mesh = function(mesh, cbMesh)
{
  var args = mesh.args;
  var tp = {pipes:{}};
  tp.server = io.listen(args.httpport||0, {log:false});

  // http is primarily for public / non-local usage, so only return the most public path
  tp.paths = function(){
    // if there's one manually configured, use that
    if(mesh.args.http) return [{type:'http',url:mesh.args.http}];

    // just use the best local one
    var port = io.server.address().port;
    var ifaces = require('os').networkInterfaces()
    var local = '127.0.0.1';
    var best = mesh.public.ipv4; // prefer that if any set
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details){
        if(details.family != 'IPv4') return;
        if(details.internal)
        {
          local = details.address;
          return;
        }
        if(!best) best = details.address;
      });
    }
    best = best||local;
    return [{type:'http',url:'http://'+best+':'+port}];
  };

  io.on('connection', function(socket){
    
    socket.on('msg', function(packet) {
      if(!packet.data) return;
      mesh.receive((new Buffer(packet.data, "base64")).toString("binary"), {type:"local", id:socket.id});
    });
  });
  mesh.deliver("local",function(to,msg){
    var buf = Buffer.isBuffer(msg) ? msg : new Buffer(msg, "binary");
    if(io.sockets.sockets[to.id])
    {
      io.sockets.sockets[to.id].emit("packet", {data: buf.toString("base64")});
    }
  });

}


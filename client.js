exports.name = 'http-client';
var io = require("socket.io-client");
var urllib = require('url');

exports.mesh = function(mesh, cbMesh)
{
  var tp = {pipes:{}};

  // turn a path into a pipe backed by a socket.io client
  tp.pipe = function(hn, path, cbPipe){
    if(typeof path != 'object' || path.type != 'http' || typeof path.url != 'string') return false;
    var url = urllib.parse(path.url);
    if(url.protocol != 'http:' && url.protocol != 'https:') return false;
    var id = url.href;
    var pipe = tp.pipes[id];
    if(pipe) return cbPipe(pipe);
    
    // create new pipe/socket.io connection
    pipe = new mesh.lib.Pipe('http-client');
    tp.pipes[id] = pipe;
    pipe.id = id;
    pipe.path = path;
    pipe.io = io.connect(id);
    
    // receive incoming socket.io messages
    pipe.io.on('msg', function(msg){
      var packet = lob.decode(new Buffer(msg,'binary'));
      if(!packet) return mesh.log.info('dropping invalid packet from',pipe.id,msg.toString('hex'));
      mesh.receive(packet, pipe);
    });
    
    // send packets out to the server as messages
    pipe.onSend = function(packet, link, cb){
      // TODO, if channel packet, use .volatile
      var msg = lob.encode(packet);
      pipe.io.emit('msg', msg.toString('binary'));
      cb();
    }

    cbPipe(pipe);
  };

  cbMesh(undefined, tp);
}


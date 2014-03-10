var client = require("./client.js");
var server = require("./server.js");

exports.install = function(self)
{
  client.install(self);
  server.install(self);
}

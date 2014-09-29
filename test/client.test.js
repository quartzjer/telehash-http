var expect = require('chai').expect;
var ext = require('../client.js');


describe('http-client', function(){

  var mockMesh = {
    lib:{Pipe:function(){return {send:function(p,l,cb){cb()}}},log:console},
    receive:function(){}
  };

  it('exports an object', function(){
    expect(ext).to.be.a('object');
  });

  it('is an extension', function(){
    expect(ext.mesh).to.be.a('function');
    expect(ext.name).to.be.equal('http-client');
  });

  it('extends a mock mesh', function(done){
    ext.mesh(mockMesh, function(err, tp){
      expect(err).to.not.exist;
      expect(tp).to.be.a('object');
      expect(tp.pipe).to.be.a('function');
      done();
    });
  });

  it('skips unknown pipe', function(done){
    ext.mesh(mockMesh, function(err, tp){
      expect(err).to.not.exist;
      expect(tp.pipe(false, {}, function(){})).to.be.false;
      done();
    });
  });

  it('creates a pipe', function(done){
    ext.mesh(mockMesh, function(err, tp){
      expect(err).to.not.exist;
      tp.pipe(false, {type:'http',url:'http://127.0.0.1'}, function(pipe){
        expect(pipe).to.exist;
        done();
      });
    });
  });

  it('sends a packet', function(done){
    ext.mesh(mockMesh, function(err, tp){
      expect(err).to.not.exist;
      tp.pipe(false, {type:'http',url:'http://127.0.0.1'}, function(pipe){
        expect(pipe).to.exist;
        pipe.send({},false,done);
      });
    });
  });

})
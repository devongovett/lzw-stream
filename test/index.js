var LZWEncoder = require('../encoder');
var LZWDecoder = require('../decoder');
var concat = require('concat-stream');
var assert = require('assert');
var fs = require('fs');

describe('lzw stream', function() {
  var file = fs.readFileSync(__dirname + '/big.txt');
    
  describe('encoder', function() {
    it('should encode a buffer', function(done) {
      var s = new LZWEncoder();
      
      s.pipe(concat(function(buf) {
        assert(buf.length < file.length);
        done();
      }));
      
      s.end(file);
    });
    
    it('should allow multiple chunks of varying sizes', function(done) {
      var s = new LZWEncoder();
      
      s.pipe(concat(function(buf) {
        assert(buf.length < file.length);
        done();
      }));
      
      for (var i = 0; i < file.length;) {
        var p = Math.random() * 2048 | 0;
        s.write(file.slice(i, i += p));
      }
      
      s.end();
    });
    
    it('should support non-default dataBits', function(done) {
      var s = new LZWEncoder(7); // works, because ascii only uses 7 bits
      
      s.pipe(concat(function(buf) {
        assert(buf.length < file.length);
        done();
      }));
      
      s.end(file);
    });
  });
  
  describe('decoder', function() {
    it('should decode a buffer', function(done) {
      var s = new LZWEncoder();
      
      s.pipe(concat(function(buf) {
        var d = new LZWDecoder();
        
        d.pipe(concat(function(buf) {
          assert(Buffer.compare(buf, file) === 0)
          done();
        }));
        
        d.end(buf);
      }));
      
      s.end(file);
    });
    
    it('should decode from a stream of multiple chunks', function(done) {
      fs.createReadStream(__dirname + '/big.txt')
        .pipe(new LZWEncoder)
        .pipe(new LZWDecoder)
        .pipe(concat(function(buf) {
          assert(Buffer.compare(buf, file) === 0)
          done();
        }));
    });
    
    it('should support non-default dataBits', function(done) {
      fs.createReadStream(__dirname + '/big.txt')
        .pipe(new LZWEncoder(7))
        .pipe(new LZWDecoder(7))
        .pipe(concat(function(buf) {
          assert(Buffer.compare(buf, file) === 0)
          done();
        }));
    });
  });
});

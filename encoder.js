var Transform = require('stream').Transform;
var util = require('util');

var MAX_DICT = 4096;

function LZWEncoder(dataBits) {
  Transform.call(this);
  
  this.dataBits = dataBits || 8;
  this.clearCode = 1 << this.dataBits;
  this.codeMask = this.clearCode - 1;
  this.eoiCode = this.clearCode + 1;
  this.nextCode = this.eoiCode + 1;
  
  this.codeSize = this.dataBits + 1;
  this.curShift = 0;
  
  this.first = true;
  this.curCode = 0;
  this.codeTable = new Map();
  
  this.cur = 0;
  this.buf = Buffer.alloc(255);
  this.pos = 0;
}

util.inherits(LZWEncoder, Transform);

LZWEncoder.prototype._transform = function(data, encoding, done) {
  var i = 0;
  if (this.first) {
    this.curCode = data[i++] & this.codeMask;
    this.emitCode(this.clearCode);
    this.first = false;
  }
  
  for (; i < data.length; i++) {
    var k = data[i] & this.codeMask;
    var curKey = this.curCode << 8 | k;
        
    if (this.codeTable.has(curKey)) {
      this.curCode = this.codeTable.get(curKey);
    } else {
      this.emitCode(this.curCode);
      
      // reset dictionary if we hit the size limit
      if (this.nextCode === MAX_DICT) {
        this.emitCode(this.clearCode);
        this.nextCode = this.eoiCode + 1;
        this.codeSize = this.dataBits + 1;
        this.codeTable = new Map();
      } else {
        // increase code size if we used up all the 
        // available bits at the current size
        if (this.nextCode >= (1 << this.codeSize))
          this.codeSize++;
        
        // add a new code to the dictionary
        this.codeTable.set(curKey,this.nextCode++);
      }
      
      this.curCode = k;
    }
  }
  
  done();
};

LZWEncoder.prototype._flush = function(done) {
  this.emitCode(this.curCode);
  this.emitCode(this.eoiCode);
  this.emitBits(1);
  this.outputBuffer();
  done();
};

LZWEncoder.prototype.emitCode = function(c) {
  this.cur |= c << this.curShift;
  this.curShift += this.codeSize;
  if (this.curShift >= 8)
    this.emitBits(8);
};

LZWEncoder.prototype.emitBits = function(bits) {
  while (this.curShift >= bits) {
    this.buf[this.pos++] = this.cur & 0xff;
    this.cur >>>= 8;
    this.curShift -= 8;
    
    if (this.pos === this.buf.length)
      this.outputBuffer();
  }
};

LZWEncoder.prototype.outputBuffer = function() {
  if (this.pos > 0)
    this.push(this.buf.slice(0, this.pos));
    
  this.buf = Buffer.alloc(255);
  this.pos = 0;
};

module.exports = LZWEncoder;

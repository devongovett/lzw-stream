# lzw-stream

A streaming LZW encoder and decoder in JavaScript

## Usage

Install using npm:

    npm install lzw-stream

Pipe data to it:

```javascript
var LZWDecoder = require('lzw-stream/decoder');
var LZWEncoder = require('lzw-stream/encoder');
var fs = require('fs');

fs.createReadStream('in.txt')
  .pipe(new LZWEncoder)
  .pipe(new LZWDecoder)
  .pipe(fs.createWriteStream('out.txt'));
```

That example will produce a file `out.txt` that is identical to `in.txt`. Not very useful, 
but it illustrates how to use both the encoder and decoder. Check out the Node 
[stream docs](http://nodejs.org/api/stream.html) for more info on streams.

### dataSize

There is a `dataSize` option for both the encoder and decoder, passed in as an argument to
the constructor, which is the number of bits in each element of the input.  It is set to 
8 (or 1 byte) by default, since all elements in a buffer are 8 bits. If you knew you had
ASCII text, for example, you could set it to 7 since all ASCII characters can be represented
in 7 bits.  This would lead to better compression. On the other hand, if your elements are 
larger than 8 bits, then `dataSize` should be set to that size. Most of the time, however,
you should just use the default.

## Browser Usage

To use lzw-stream in the browser, check out [Browserify](http://browserify.org), which 
builds Node-style modules for browser usage.

## License

MIT

/* serial port */
const SerialPort = require('serialport');
/* streams */
const Stream = require('stream');
/* colors in console */
const colors = require('colors');

/* cnc class */
class CNC extends Stream.Writable
{
    /* class constructor */
    constructor(options)
    {
        /* call event emitter class constructor */
        super();
        
        /* internal gcode line buffer */
        this._line = '';
        this._lineNum = 1;
        
        /* serial port initialize: chips use 115200 bps by default */
        this._sp = new SerialPort(options.portName, { 
            baudRate : 115200 });
        /* parse full lines */
        this._parser = this._sp.pipe(new SerialPort.parsers.Readline());
        
        /* listen to port open */
        this._sp.once('open', () => { 
            /* clear port */
            this._sp.flush(() => this.emit('open'));
        });
        
        /* port opening may fail, port will emit close if it's 
         * disconnected, which may happen when one is using a usb dongle 
         */
        this._sp.once('error', (err) => { this.emit('error', err); });
        this._sp.once('close', (err) => {
            /* abnormal port close? */
            if (err)
                this.emit('error', err);
            /* emit close event */
            this.emit('close');
        });
    }
    
    /* close communication */
    _close(callback)
    {
        this._sp.close(callback);
    }

    /* stream write function */
    _write(chunk, encoding, callback)
    {
        /* split into separate lines */
        var i = 0, line = chunk.toString(), lines = line.split(/\r?\n/);
        
        /* send function */
        var send = () => {
            /* glue to the end of currently buffered line */
            this._line += lines[i];
            /* send all complete lines */
            if (i < lines.length - 1) {
                i++, this._sendLine(send);
            /* last chunk */
            } else {
                callback();
            }
        };

        /* this shall start the whole sending process */
        send();
    }
    
    /* send currently buffered line */
    _sendLine(callback)
    {
        /* consume a single line */
        this._parser.once('data', (data) => {
            /* log to console */
            console.log(this._lineNum.toString().underline + ': ' + this._line.white + ' ' + 
                data.green);
            /* clear line */
            this._line = '', this._lineNum++;
            callback(); 
        });
        
        /* write line */
        this._sp.write(this._line + '\r\n');
    }
}

/* export class */
module.exports = CNC;
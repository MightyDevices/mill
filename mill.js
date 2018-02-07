/* serial port */
const CNC = require('./cnc');
/* input arguments */
const argv = require('minimist')(process.argv.slice(2));
/* filesystem stuff */
const fs = require('fs');

/* check parameters */
if (!argv.p || !argv.f) {
    console.log('Usage: mill -f [fileName] -p [portName]')
/* got parameters? */
} else {
    /* open cnc */
    var cnc = new CNC({portName : argv.p});
    /* cnc opened event */
    cnc.once('open', () => {
        fs.createReadStream(argv.f).pipe(cnc);
    });
}


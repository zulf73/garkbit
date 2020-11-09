'use strict'
require('@babel/register');
var server = require('./server').default;

var port = process.env.GARKBIT_PORT || 3000;

server.listen(port, function () {
    console.log('[GARKBIT] Server listening on port', port);
});

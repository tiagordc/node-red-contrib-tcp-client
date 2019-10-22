'use strict';

module.exports = function (RED) {

    //https://github.com/node-red/node-red/blob/master/packages/node_modules/%40node-red/nodes/core/network/31-tcpin.js

    var socketTimeout = RED.settings.socketTimeout||null;

    function TcpClient(config) {

        var net = require('net'); //https://nodejs.org/api/net.html

        RED.nodes.createNode(this, config);

        this.action = config.action || "listen"; /* listen,close */
        this.port = config.port * 1;
        this.topic = config.topic;
        this.stream = (!config.datamode || config.datamode=='stream'); /* stream,single*/
        this.datatype = config.datatype || 'buffer'; /* buffer,utf8,base64,xml */
        this.newline = (config.newline || "").replace("\\n","\n").replace("\\r","\r");
        this.closing = false;
        this.connected = false;

        const node = this;

        var connectionPool = {};
        var server;

        node.on('input', function (msg, nodeSend, nodeDone) {

            if (config.actionType === 'msg' || config.actionType === 'flow' || config.actionType === 'global') {
                node.action = RED.util.evaluateNodeProperty(config.action, config.actionType, this, msg);
            }

            if (config.portType === 'msg' || config.portType === 'flow' || config.portType === 'global') {
                node.port = (RED.util.evaluateNodeProperty(config.port, config.portType, this, msg)) * 1;
            }

            var id = node.port.toString(16);

            if (typeof server === 'undefined') {

                server = net.createServer(function (socket) {

                    socket.setKeepAlive(true, 120000);
    
                    if (socketTimeout !== null) {
                        socket.setTimeout(socketTimeout);
                    }
    
                    connectionPool[id] = socket;
    
                    var buffer = (node.datatype == 'buffer') ? Buffer.alloc(0) : "";
    
                    socket.on('data', function (data) {
    
                        if (node.datatype != 'buffer') {
                            data = data.toString(node.datatype == 'xml' ? 'utf8' : node.datatype);
                        }
    
                        if (node.stream) {
    
                            var result = {
                                topic: msg.topic || config.topic
                            };
    
                            if ((typeof data) === "string" && node.newline !== "") {
    
                                buffer = buffer + data;
                                var parts = buffer.split(node.newline);
    
                                for (var i = 0; i < parts.length - 1; i += 1) {
                                    
                                    result.payload = parts[i];
    
                                    if (node.datatype == 'xml') {
    
                                        var xml2js = require('xml2js');
                                        var parseXml = xml2js.parseString;
                                        var parseOpts = {};
                                        parseOpts.async = true;
                                        parseOpts.attrkey = '$';
                                        parseOpts.charkey = '_';
    
                                        if (config.xmlStrip) {
                                            var stripPrefix = require('xml2js').processors.stripPrefix;
                                            parseOpts.tagNameProcessors = [ stripPrefix ];
                                        }
    
                                        var parseStr = result.payload.replace(/^[\x00\s]*/g, "");//Non-whitespace before first tag
                                        parseStr += node.newline;
    
                                        parseXml(parseStr, parseOpts, function (parseErr, parseResult) {
                                            if (!parseErr) { 
                                                result.payload = config.xmlSimplify ? simplifyXML(parseResult) : parseResult;
                                                nodeSend(result);
                                            }
                                        });
    
                                    }
                                    else {
                                        nodeSend(result);
                                    }
    
                                }
    
                                buffer = parts[parts.length - 1];
    
                            }
                            else {
                                result.payload = data;
                                nodeSend(result);
                            }
    
                        }
                        else {
    
                            if ((typeof data) === "string") {
                                buffer = buffer + data;
                            }
                            else {
                                buffer = Buffer.concat([buffer, data], buffer.length + data.length);
                            }
    
                        }
    
                    });
    
                    socket.on('end', function () {
                        if (!node.stream || (node.datatype === "utf8" && node.newline !== "")) {
                            if (buffer.length > 0) {
                                var result = {
                                    topic: msg.topic || config.topic,
                                    payload: buffer
                                };
                                nodeSend(result);
                            }
                            buffer = null;
                        }
                    });
    
                    socket.on('timeout', function () {
                        socket.end();
                    });
    
                    socket.on('close', function () {
                        delete connectionPool[id];
                    });
    
                    socket.on('error', function (err) {
                        node.log(err);
                    });
    
                });
                
                server.on('error', function (err) {
                    if (err) {
                        node.error(err);
                    }
                });

            }

            var close = function() {
                if (connectionPool[id]) {
                    var socket = connectionPool[id];
                    socket.end();
                    socket.destroy();
                    socket.unref();
                    server.close();
                    delete connectionPool[id];
                }
            };

            var listen = function() {
                if (typeof connectionPool[id] === 'undefined') {
                    server.listen(node.port, function (err) {
                        if (err) {
                            node.error(err);
                        }
                    });
                }
                else {
                    node.error(`Already listening on port ${node.port}`);
                }
            };

            switch (node.action.toLowerCase()) {
                case 'close':
                    close();
                    break;
                default:
                    listen();
            }

        });

        node.on("close",function() {

            for (var c in connectionPool) {
                if (connectionPool.hasOwnProperty(c)) {
                    var socket = connectionPool[c];
                    socket.end();
                    socket.destroy();
                    socket.unref();
                }
            }

            server.close();
            connectionPool = {};
            node.status({});

        });

        function simplifyXML(message) {
    
            if (typeof message !== 'object') 
                return message;
            
            var keys = Object.keys(message);
            var result = message;
            
            if (keys.length === 1 && keys[0] === '0') { // instanceOf Array
                result = result['0'];     
            }
    
            if (typeof result === 'object')  {
                for (var prop in result) {
                    result[prop] = simplifyXML(result[prop]);
                }
            }
          
            return result;
              
        }

    };

    RED.nodes.registerType("tcp-client", TcpClient);

};
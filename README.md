# node-red-contrib-tcp-client-con
Forked to fix issue with close action.
Original package https://github.com/tiagordc/node-red-contrib-tcp-client

![GitHub package.json version](https://img.shields.io/github/package-json/v/tiagordc/node-red-contrib-tcp-client?label=package)
![npm](https://img.shields.io/npm/v/node-red-contrib-tcp-client)
![npm](https://img.shields.io/npm/dm/node-red-contrib-tcp-client)

This node is a **TCP client** that listens for connections on specific port or connects to a specified host.

Unlike the default node-red tcp-in node, this one allows you to create dynamic TCP connections passed as arguments.

Allows stopping the connection by passing a "close" argument:

![node configuration](https://raw.githubusercontent.com/tiagordc/node-red-contrib-tcp-client/master/flow.png)

This project was developed specifically for XML over TCP with some parsing options but other formats should still be supported.

To report an issue use the project [GitHub](https://github.com/tiagordc/node-red-contrib-tcp-client/issues) page

## Configuration:

![node configuration](https://raw.githubusercontent.com/tiagordc/node-red-contrib-tcp-client/master/edit.png)

## To install: 

Install [node-red](https://nodered.org/).

Install [this package](https://www.npmjs.com/package/node-red-contrib-tcp-client) with "npm install node-red-contrib-tcp-client --save" in ~./node-red or via the Palette Manager in node-red.

If everything was successfull you should see the new tcp client node under the network category.

https://flows.nodered.org/node/node-red-contrib-tcp-client

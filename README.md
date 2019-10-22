# node-red-contrib-tcp-client

Unlike the default node-red tcp-in node, this one allows you to create dynamic TCP connections.

Allows stopping an existing connection by passing a "close" action:

![node configuration](https://raw.githubusercontent.com/tiagordc/node-red-contrib-tcp-client/master/flow.png)

Added support to XML over TCP with parsing and some options on the output.

## How it works:

![node configuration](https://raw.githubusercontent.com/tiagordc/node-red-contrib-tcp-client/master/edit.png)

## To install: 

Install node-red.

Install this package with "npm install node-red-contrib-tcp-client --save" in ~./node-red or via the Palette Manager in node-red.

If everything was successfull you should see the new tcp node under the network category.

https://flows.nodered.org/node/node-red-contrib-tcp-client

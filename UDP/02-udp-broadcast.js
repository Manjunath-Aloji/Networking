const dgram = require("dgram");

const server = dgram.createSocket("udp4");

server.on("message", (msg, rinfo) => {
    console.log(`Broadcast Received: ${msg} from ${rinfo.address}:${rinfo.port}`);  
})

server.bind(9000, () => {
    console.log("Listening for broadcast packets on port 9000");
    server.setBroadcast(true);
})
const dgram = require("dgram");
const server = dgram.createSocket("udp4");

server.on("message", (msg, rinfo) => {
	console.log(`Received : ${msg.toString().trim()} from ${rinfo.address}:${rinfo.port}`);
	server.send(msg, rinfo.port, rinfo.address);
});

server.bind(9000, () => {
	console.log("UDP server listening on port 9000");
});

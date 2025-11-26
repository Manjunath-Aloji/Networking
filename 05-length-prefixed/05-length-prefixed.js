const net = require("net");

function encodePacket(type, payloadString) {
    const payload = Buffer.from(payloadString, "utf-8");
    const length = 1 + payload.length;

    const buffer = Buffer.alloc(4 + length);
    buffer.writeUInt32BE(length, 0) // write length at the index 0
    buffer.writeUInt8(type, 4) // write type at index 4 that is after size of packet
    payload.copy(buffer, 5)
}

let buffer = Buffer.alloc(0)

function onData(chunk) {
    buffer = Buffer.concat([buffer, chunk]);
    
    while (buffer.length >= 4) {
        // console.log("Inside While actual packet : ", chunk.toString());
        
        const length = buffer.readUInt32BE(0);

        if (buffer.length < 4 + length) {
            console.log("Buffer length doesn't match the metadat length, current lemgth : ", buffer.length, "Expected Length : ", length);
            return;
        }

        const packet = buffer.slice(4, 4 + length)
        handlePacket(packet)
        buffer = buffer.slice(4 + length)
    }
}

function handlePacket(packet) {
    const type = packet.readUInt8(0)
    const payload = packet.slice(1).toString();
    console.log(`[Packet][Type ${type}]:`, payload);
    

    // console.log("PACKET RECEIVED;");
    // console.log("TYPE : ", type);
    // console.log("Payload : ", payload);
    
}

const server = net.createServer((socket) => {
    console.log(`Client connected ${socket.remoteAddress}:${socket.remotePort}`);

    socket.on("data", onData)

    socket.on("end", () => {
        console.log(`Client disconnected ${socket.remoteAddress}:${socket.remotePort}`);
    })
})

server.listen(9000, () => {
    console.log('Server Listening on 9000');
})
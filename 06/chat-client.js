const net = require("net");
 
const PACKET = {
  AUTH: 1,
  MESSAGE: 2,
  PRIVATE_MESSAGE: 3,
  JOIN_CHANNEL: 4,
  LEAVE_CHANNEL: 5,
  SERVER_BROADCAST: 6,
  ERROR_MESSAGE: 7,
};
 
function encodePacket(type, payloadString) {
  const payload = Buffer.from(payloadString, "utf8");
  const length = 1 + payload.length;
 
  const buffer = Buffer.alloc(4 + length);
  buffer.writeUInt32BE(length, 0);
  buffer.writeUInt8(type, 4);
  payload.copy(buffer, 5);
 
  return buffer;
}
 
let buffer = Buffer.alloc(0);
 
function decodeIncoming(chunk) {
  buffer = Buffer.concat([buffer, chunk]);
 
  while (buffer.length >= 4) {
    const length = buffer.readUInt32BE(0);
 
    if (buffer.length < 4 + length) break;
 
    const packet = buffer.slice(4, 4 + length);
    buffer = buffer.slice(4 + length);
 
    const type = packet.readUInt8(0);
    const payload = packet.slice(1).toString();
 
    console.log(`\n<< SERVER PACKET >>`);
    console.log(`Type: ${type}`);
    console.log(`Payload: ${payload}`);
  }
}
 
const socket = net.connect(9000, () => {
  console.log("Connected to server");
 
  // First thing: AUTH
  socket.write(encodePacket(PACKET.AUTH, "manju2"));
});
 
socket.on("data", decodeIncoming);
 
// CLI input
process.stdin.on("data", (input) => {
  const str = input.toString().trim();
 
  if (str.startsWith("/msg")) {
    // const [_, channel, ...msg] = str.split(" ");
    // console.log(msg);

    const parts = str.split(":")
    const [_, channel] = parts[0].split(" ")
    
    socket.write(
      encodePacket(PACKET.MESSAGE, `${channel}:${parts[1]}`)
    );
  }
 
  else if (str.startsWith("/pm")) {
    const parts = str.split(":")
    const [_, username] = parts[0].split(" ")
    
    socket.write(
      encodePacket(PACKET.PRIVATE_MESSAGE, `${username}:${parts[1]}`)
    );
  }
 
  else if (str.startsWith("/join")) {
    const [_, channel] = str.split(" ");
    socket.write(encodePacket(PACKET.JOIN_CHANNEL, channel));
  }
 
  else if (str.startsWith("/leave")) {
    const [_, channel] = str.split(" ");
    socket.write(encodePacket(PACKET.LEAVE_CHANNEL, channel));
  }
 
  else {
    console.log("Unknown command");
  }
});
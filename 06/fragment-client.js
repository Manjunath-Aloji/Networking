// fragment-client.js
const net = require("net");
 
function encodePacket(type, payloadString) {
  const payload = Buffer.from(payloadString, "utf8");
  const length = 1 + payload.length;
  const buffer = Buffer.alloc(4 + length);
 
  buffer.writeUInt32BE(length, 0);
  buffer.writeUInt8(type, 4);
  payload.copy(buffer, 5);
 
  return buffer;
}
 
// Randomly split a buffer into random-chunk sizes (1–8 bytes)
function randomFragment(buffer) {
  let result = [];
  let i = 0;
 
  while (i < buffer.length) {
    const chunkSize = Math.floor(Math.random() * 8) + 1; // 1–8 bytes
    result.push(buffer.slice(i, i + chunkSize));
    i += chunkSize;
  }
 
  return result;
}
 
const socket = net.connect(9000, () => {
  console.log("Connected to server.");
 
  // Create a test packet
  const packet = encodePacket(6, "Fragmentation test: Hello from client!");
 
  // Split into random fragments
  const fragments = randomFragment(packet);
 
  console.log("Sending fragments (sizes):", fragments.map(f => f.length));
 
  // Send each fragment with small delay
  fragments.forEach((frag, i) => {
    setTimeout(() => socket.write(frag), i * 100);
  });
 
  // send multiple packets glued together
  const p1 = encodePacket(6, "A. The sky turned orange at sunset.");
  const p2 = encodePacket(6, "B. Time moves faster than we notice.");
  const p3 = encodePacket(6, "C. Testing is easier with clean data.");
 
  const combined = Buffer.concat([p1, p2, p3]);
  const combinedFrags = randomFragment(combined);
 
  setTimeout(() => {
    console.log("Sending glued packets in fragments:", combinedFrags.map(f => f.length));
    combinedFrags.forEach((frag, i) => {
      setTimeout(() => socket.write(frag), i * 80);
    });
  }, 2000);
});
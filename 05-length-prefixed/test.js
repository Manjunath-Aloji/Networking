const net = require("net");
import { text } from "../utils/constants";

function encodePacket(type, payloadString) {
  const payload = Buffer.from(payloadString, "utf-8");
  const length = 1 + payload.length;

  const buffer = Buffer.alloc(4 + length);
  buffer.writeUInt32BE(length, 0); // write length at the index 0
  buffer.writeUInt8(type, 4); // write type at index 4 that is after size of packet
  payload.copy(buffer, 5);

  return buffer;
}

const client = net.connect(9000, () => {
  client.setNoDelay(true);
  // for (let i=0; i < 1000; i++) {
  //     client.write(encodePacket("1", "h"))
  // }
  client.write(encodePacket(1, text));
});

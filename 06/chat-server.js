const net = require("net");

const PACKET = {
  AUTH: 1,
  MESSAGE: 2,
  PRIVATE_MESSAGE: 3,
  JOIN_CHANNEL: 4,
  LEAVE_CHANNEL: 5,
  SERVER_BROADCAST: 6,
  ERROR_MESSAGE: 7,
  CHANNEL_LIST: 8,
  USER_LIST: 9,
};

const channels = [
  { id: 1, name: "#General", clients: [] },
  { id: 2, name: "#Sports", clients: [] },
  { id: 3, name: "#Networking", clients: [] },
];

const clients = [];
const usernames = new Set();

function encodePacket(type, payloadString) {
  const payload = Buffer.from(payloadString, "utf-8");
  const length = 1 + payload.length;

  const buffer = Buffer.alloc(4 + length);
  buffer.writeUInt32BE(length, 0); // write length at the index 0
  buffer.writeUInt8(type, 4); // write type at index 4 that is after size of packet
  payload.copy(buffer, 5);

  return buffer;
}

async function handleAuth(payload, socket) {
    if (usernames.has(payload.trim().toLowerCase())) {
        socket.write(encodePacket(PACKET.ERROR_MESSAGE, "Username Already Taken, Please provide another, username : "));
        return {success : false, socket}
    }
    socket.username = payload.trim().toLowerCase();
    socket.channels = [];
    usernames.add(payload.trim().toLowerCase());
    await socket.write(encodePacket(PACKET.SERVER_BROADCAST, `Process complete welcome to server : ${payload}`));
    return {
        success : true,
        socket,
    }
}

async function handleMessage(payload, socket) {
    if (!payload || !socket) {
        socket.write(encodePacket(PACKET.ERROR_MESSAGE, "Something went wrong.!!\n"));
        console.error("Payload and Socket are needed to process the message");
        return {success : false, socket}
    }
    const parts = payload.split(":")

    if (parts.length < 2) {
        socket.write(encodePacket(PACKET.ERROR_MESSAGE, "Inavalid payload, please use <channelname>:<message>\n"));
        console.error("Inavalid payload, please use <channelname>:<message>");
        return {success : false, socket}
    }

    const Inputchannel = parts[0].trim().toLowerCase();
    const channel = channels.find((channel) => channel.name.toLowerCase() === `#${Inputchannel}`)

    if (!channel) {
        socket.write(encodePacket(PACKET.ERROR_MESSAGE, "Inavalid Channel\n"));
        console.error("Inavalid Channel");
        return {success : false, socket}
    }

    const user = channel.clients.find((client) => client === socket);

    if (!user) {
        socket.write(encodePacket(PACKET.ERROR_MESSAGE, "Your not a part of this chnnel.\n"));
        console.error("Inavalid user");
        return {success : false, socket}
    }

    channel.clients
    .filter((client) => client !== socket)
    .forEach((client) => client.write(encodePacket(PACKET.MESSAGE, `${socket.username}: ${parts[1]}`)))

    return {success : true, socket}

}

async function handlePrivateMessage(payload, socket) {
    const [username, message] = payload.split(":");
    console.log(payload, "PRIVATE");
    
    if (!username || !message) {
        socket.write(encodePacket(PACKET.ERROR_MESSAGE, "username and message are needed to process the message.\n"));
        console.error("username and message are needed to process the message");
        return {success : false, socket} 
    }
    const user = clients.find((client) => client.username.toLowerCase() === username.toLowerCase());

    if (!user) {
        socket.write(encodePacket(PACKET.ERROR_MESSAGE, "User Not Found.\n"));
        return {success : false, socket}
    }

    user.write(encodePacket(PACKET.PRIVATE_MESSAGE, `${socket.username}:${message}`))
}

async function handleJoin(payload, socket) {
    if (!payload) {
        socket.write(encodePacket(PACKET.ERROR_MESSAGE, "Please Provide a valid channel name\n"));
        return {success : false, socket} 
    }
    const channel = channels.find((channel) => channel.name.toLowerCase() === `#${payload.trim().toLowerCase()}`)
    if (!channel) {
        socket.write(encodePacket(PACKET.ERROR_MESSAGE, "Please Provide a valid channel name\n"));
        return {success : false, socket} 
    }

    const user = channel.clients.find((client) => client === socket);
    if (user) {
        socket.write(encodePacket(PACKET.SERVER_BROADCAST, "Your Already A Part of this channel.\n"));
        return {success : true, socket} 
    }

    socket.channels.push(channel.id);

    channel.clients.forEach((client) => client.write(encodePacket(PACKET.SERVER_BROADCAST, `${socket.username} has joined the channel.`)))

    channel.clients.push(socket)
    return {success : true, socket}
}
async function handleLeave(payload, socket) {
     if (!payload) {
        socket.write(encodePacket(PACKET.ERROR_MESSAGE, "Please Provide a valid channel name\n"));
        return {success : false, socket} 
    }
    const channel = channels.find((channel) => channel.name.toLowerCase() === `#${payload.trim().toLowerCase()}`)
    if (!channel) {
        socket.write(encodePacket(PACKET.ERROR_MESSAGE, "Please Provide a valid channel name\n"));
        return {success : false, socket} 
    }

    const user = channel.clients.find((client) => client === socket);
    if (!user) {
        socket.write(encodePacket(PACKET.SERVER_BROADCAST, "Your not a part of this channel.\n"));
        return {success : true, socket} 
    }

    const channelIndex = socket.channels.indexOf(channel.id)
    if (channelIndex > -1) {
        socket.channels.splice(channelIndex, 1)
    }

    const clientIndex = channel.clients.indexOf(socket);
    if (clientIndex > -1) {
        channel.clients.splice(clientIndex, 1);
        channel.clients.forEach((client) =>
          client.write(encodePacket(PACKET.SERVER_BROADCAST, `${socket.username} has left the channel.`))
        );
    }

    return {success : true, socket}
}

async function handlePacket(packet, socket) {
  const type = packet.readUInt8(0);
  const payload = packet.slice(1).toString();
//   console.log(`[Packet][Type ${type}]:`, payload);

  switch (type) {
    case PACKET.AUTH:
        const result = await handleAuth(payload, socket);
        if(result.success) clients.push(result.socket);
        break;
    case PACKET.MESSAGE:
        handleMessage(payload, socket);
        break;
    case PACKET.PRIVATE_MESSAGE:
        handlePrivateMessage(payload, socket);
        break;
    case PACKET.JOIN_CHANNEL:
        handleJoin(payload, socket)
        break;
    case PACKET.LEAVE_CHANNEL:
        handleLeave(payload, socket)
        break;
    case PACKET.SERVER_BROADCAST:
        console.log(`SERVER BROADCAST : ${payload}`);
        socket.write(encodePacket(PACKET.SERVER_BROADCAST, payload))
        break;
    default:
        socket.write(encodePacket(PACKET.ERROR_MESSAGE, "Unknown Packet Type"));
        break;
  }
}

const server = net.createServer((socket) => {
  socket.write(encodePacket(PACKET.SERVER_BROADCAST, "WELCOME TO THE SERVER"));
  let buffer = Buffer.alloc(0);

  socket.on("data", (chunk) => {
    console.log("ORGINAL CHUNK", chunk.toString().trim());
    
    buffer = Buffer.concat([buffer, chunk])
    while (buffer.length >= 4) {
      const length = buffer.readUInt32BE(0);
      if (buffer.length < 4 + length) break;

      const packet = buffer.slice(4, 4 + length)

      buffer = buffer.slice(4 + length)

      handlePacket(packet, socket)
    }
  });
});

server.listen(9000, () => {
  console.log("Server Listening on port 9000");
});

const net = require("net");

let clients = [];
const server = net.createServer((socket) => {
  console.log(
    `Client connected : ${socket.remoteAddress}:${socket.remotePort}`
  );
  clients.forEach((client) =>
    client.write(
      `Client ${socket.remoteAddress}:${socket.remotePort} has joined the broadcast\n`
    )
  );
  clients.push(socket);
  socket.write("Welcome to broadcast\n");

  socket.on("data", (data) => {
    console.log(
      `Received data from client : ${socket.remoteAddress}:${
        socket.remotePort
      } : ${data.toString().trim()}`
    );
    clients
      .filter((client) => client !== socket)
      .forEach((client) => client.write(data.toString()));
  });

  socket.on("end", () => {
    console.log(
      `Client Disconnected : ${socket.remoteAddress}:${socket.remotePort}`
    );
    // clients = clients.filter((client) => client !== socket);
    const index = clients.indexOf(socket);
    if (index > -1) clients.splice(index, 1);
    clients.forEach((client) =>
      client.write(
        `Client  ${socket.remoteAddress}:${socket.remotePort} has left the broadcast\n`
      )
    );
  });
});

server.listen(9000, () => {
  console.log("Broadcast server listening on 9000");
});

const net = require("net");

const server = net.createServer((socket) => {
  console.log("Client Connected", socket.remoteAddress, socket.remotePort);

  socket.on("data", (data) => {
    // console.log("Raw Data Buffer", data);
    // console.log("Raw Data ASCII", [...data]);
    console.log("Received : ", data.toString());
    socket.write(data);
  });

  socket.on("end", () => {
    console.log("Client Disconnected.");
  });
});

server.listen(9000, () => {
  console.log("TCP echo server listening on port 9000");
});

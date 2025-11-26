const net = require("net");

//TODO : solve ambiguity by sperating channels with # e.g #general
const channels = [
    { id: 1, name: "General", clients: [] },
    { id: 2, name: "Sports", clients: [] },
    { id: 3, name: "Networking", clients: [] },
];
const clients = [];
const usernames = new Set();
usernames.add("general");
usernames.add("sports");
usernames.add("networking");
const commandList = ["/help", "/msg", "/list-channels", "/join", "/leave"];
const helper = `
/help                           -   For help.
/msg <username> <message>       -   For private messaging.
/msg <channelname> <message>    -   Send message inside a channel.
/list-channels                  -   View the list of available channels.
/join <channelname>             -   To join the channel.
/leave <channelname>            -   To leave the channel.\n\n`;

const handleMessage = (parts, socket) => {
  if (!parts || parts.length < 3) {
    socket.write(
      "Invalid Command.\nCommand Usage : /msg <username or channelname> <message>\n"
    );
    return;
  }

  const channel = channels.find(
    (channel) => channel.name.toLowerCase() === parts[1].toLowerCase()
  );
  const user = clients.find(
    (client) => client.username.toLowerCase() === parts[1].toLowerCase()
  );

  if (!channel && !user) {
    socket.write(
      `Invalid user/channel. Please provide a valid user/channel.\n`
    );
    return;
  }

  if (channel) {
    channel.clients.forEach((client) =>
      client.write(
        `${channel.name} - ${socket.username} : ${parts.slice(2).join(" ")}`
      )
    );
    return;
  }

  if (user) {
    user.write(
      `private message from ${socket.username} : ${parts.slice(2).join(" ")}`
    );
    socket.write("Message Sent\n");
    return;
  }

  return;
};

const handleChannel = (parts, socket) => {
  if (!parts || parts.length < 2) {
    socket.write(
      `Invalid Command.\nCommand Usage : ${
        parts?.[0] || "/join or /leave"
      } <channelname> <message>\n`
    );
    return;
  }

  const channelname = parts[1].trim().toLowerCase();
  const channel = channels.find((c) => c.name.toLowerCase() === channelname);

  if (!channel) {
    socket.write(`Channel ${parts[1]} doesn't exists.\n`);
    return;
  }

  const user = channel.clients.find((client) => client.username === socket.username);

  if (parts[0].trim().toLowerCase() === "/join") {
    if (user) {
        socket.write(`Your already part of the channel.\n`);
        return;
    }
    channel.clients.forEach((client) => client.write(`${socket.username} has joined the ${channel.name}.\n`))
    socket.channels.push(channel.id)
    channel.clients.push(socket)
    return;
}
  if (parts[0].trim().toLowerCase() === "/leave") {
    if (!user) {
        socket.write(`Your not a part of this channel.\n`);
        return;
    }
    const clientIndex  = channel.clients.indexOf(socket);
    const channelIndex = socket.channels.indexOf(channel.id)
    if (channelIndex > -1) {
        socket.channels.splice(channelIndex, 1);
    }
    if (clientIndex > -1) {
        channel.clients.splice(clientIndex, 1);
        channel.clients.forEach((client) => client.write(`${socket.username} has left the ${channel.name}.\n`))
    }
    return;
}

  return;
};

const commandParser = (data, socket) => {
  const parts = data.split(" ");
  const command = parts[0];

  if (data.startsWith("/help")) {
    socket.write(`${helper}`);
    return;
  }
  if (data.startsWith("/list-channels")) {
    const channelnames = channels?.map((channel) => channel.name);
    let structured = "";
    channelnames.forEach((name, index) => {
      structured = structured + `${index + 1} : ${name}\n`;
    });
    socket.write(`Available Channels\n${structured}`);
    return;
  }

  if (!commandList.includes(command)) {
    socket.write(`Command Unknown\n ${helper}`);
    return;
  }

  if (data.startsWith("/msg")) {
    handleMessage(parts, socket);
    return;
  }

  if (data.startsWith("/join") || data.startsWith("/leave")) {
    handleChannel(parts, socket)
    return;
  }

  return;
};

const server = net.createServer((socket) => {
  console.log(
    `Client Connected : ${socket.remoteAddress}:${socket.remotePort}`
  );

  let isNameProvided = false;
  socket.write(
    `Welcome to the tcp server\nPlease provide a name to continue : `
  );

  socket.on("data", (data) => {
    const d = data.toString();
    if (!isNameProvided) {
      const username = d.trim().toLowerCase();
      if (usernames.has(username)) {
        socket.write("Username Already Taken Please provide another : ");
        return;
      }
      usernames.add(username);
      socket.username = username;
      socket.channels = [1];
      const generalChannel = channels.find(
        (channel) => channel.name.toLowerCase() === "general"
      );
      generalChannel.clients.forEach((client) =>
        client.write(
          `${socket.username} has joined the ${generalChannel.name} channel.\n`
        )
      );
      generalChannel.clients.push(socket);
      socket.write(
        `Process Complete Wel Come To The Server ${socket.username}\n`
      );
      isNameProvided = true;
      clients.push(socket);
      return;
    }

    commandParser(d, socket);
  });

  socket.on("end", () => {
    const clientChannels = channels.filter((channel) =>
      socket.channels.includes(channel.id)
    );

    clientChannels.forEach((channel) => {
      let clientIndex = channel.clients.indexOf(socket);
      if (clientIndex > -1) {
        channel.clients.splice(clientIndex, 1);
        channel.clients.forEach((client) =>
          client.write(`${socket.username} has left the channel.`)
        );
      }
    });
  });
});

server.listen(9000, () => {
  console.log(`Server listening on port 9000`);
});

const dgram = require("dgram");
const client = dgram.createSocket("udp4");

client.bind(() => {
    client.setBroadcast(true);

    const msg = Buffer.from("Hello to everyone the server!!");
    client.send(msg, 9000, "255.255.255.255", () => {
        client.close();
    })
})
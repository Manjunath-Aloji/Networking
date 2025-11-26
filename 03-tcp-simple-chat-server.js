const net = require("net");

let clients = []
const usernames = new Set()

const server = net.createServer((socket) => {
    console.log("Client Connected : ", socket.remoteAddress, socket.remotePort);
    socket.write("Please enter your name : ")
    let isName = false;
    
    socket.on("data", (data) => {
        const d = data.toString().trim()
        if (!isName) {
            if (usernames.has(d)) {
                socket.write("Username Already Taken Please provide another : ")
                return;
            }
            usernames.add(d.toLowerCase())
            isName = true;
            socket.username = d.toLowerCase();
            clients.push(socket)
            socket.write(`Welcome ${socket.username}\n`)
            return;
        } 
            
        if (data.toString().startsWith("/msg")) {

            const parts = data.toString().split(" ")

            if (parts.length < 3) {
                socket.write("Command Usage : /msg <username> <message>")
                return;
            }

            const user = parts[1]
            const message = parts.slice(2).join(" ")
            const client = clients.find((c) => c.username.toLowerCase() === user.toLowerCase())

            if (!client) {
                socket.write("user not found");
                return;
            }

            client.write(`Private Message From ${socket.username} : ${message}`)

            // const user = d.split(" ")[1]
            // const client = clients.filter((s) => s.username === user)[0]
            // client.write(`Private Message From ${socket.username} : ${data.toString().split(user)[1].trim()}\n`)
            return;
        }
        console.log("Public Data Received From", socket.username, " : ", d)
        clients.filter((s) => s !== socket).map((s) => s.write(`Message From ${socket.username} : ${data.toString()}`))
    })

    socket.on("end", () => {
        clients = clients.filter((s) => s !== socket)
        console.log("Client Disconnected", socket.username);
    })
})

server.listen(9000, () => {
    console.log("Server Listeninng on 9000");
})
# Networking – A Practical Journey.

## 🌐 What Exactly Is the Internet?

The Internet is:

### ✔ A network of networks
A global system that interconnects millions of independent networks so computers everywhere can exchange data.

### ✔ Distributed
There is no single central controller.  
Any machine capable of sending/receiving data using networking protocols can be part of the Internet.

### ✔ Governed by important organizations
- **ISOC (Internet Society)** – global nonprofit maintaining Internet openness & trust  
- **IETF (Internet Engineering Task Force)** – designs the Internet’s protocols  
- **IAB (Internet Architecture Board)** – provides architectural oversight  
- **IRTF (Internet Research Task Force)** – researches future protocols (5–10 years ahead)

---

## 🔌 What Is Networking?

Networking means connecting computers so they can **send data to each other**.

Devices in a network:

- communicate through cables, WiFi, fiber, and radio  
- send data broken into **packets**  
- route packets across switches, routers, ISPs  
- reassemble packets at the destination

Types of networks:

- **LAN** – Local Area Network  
- **WAN** – Wide Area Network  
- **The Internet** – the largest WAN  

---

## 📦 Packets

A packet is a small piece of a larger message.

A typical packet:

```
[HEADER][DATA]
```

Header contains:

- Source & destination  
- Sequencing information  
- Length  
- Type  
- Other protocol metadata  

Packets travel independently, may:

- arrive out of order  
- arrive broken into fragments  
- get merged with other packets  

Your software must reassemble them.

---

## 🔧 Protocols

Protocols are standardized methods that allow all computers to communicate reliably.

Examples:

- **IP** – routing  
- **TCP** – reliable transport  
- **UDP** – fast, unreliable transport  
- **DNS** – name lookup  
- **HTTP/HTTPS** – Web communication  
- **QUIC** – next-gen transport (HTTP/3)

Protocols solve interoperability between different hardware, software, and networks.

---

# 🧠 Project Journey

## 1️⃣ TCP Echo Server
File: `01-tcp-echo-server.js`

A minimal server that:

- accepts a connection  
- receives data  
- echoes it back  

Learns:

- how sockets work  
- how TCP data events behave  
- how to send responses  

---

## 2️⃣ Broadcast TCP Server
File: `02-broadcast-tcp-server.js`

Supports:

- multiple clients  
- broadcasting messages from one client to all others  

Learns:

- managing socket lists  
- handling disconnects  
- building simple broadcasting logic  

---

## 3️⃣ Simple Chat Server
File: `03-simple-chat-server.js`

Includes:

- username assignment  
- private messages  
- basic commands  

Learns:

- command parsing  
- message routing  
- handling multiple types of operations  

---

## 4️⃣ Channel-Based Chat Server
File: `04-channels-chat-server.js`

Adds:

- joining/leaving channels  
- sending channel-scoped messages  
- global + private messaging  

This introduces:

- channel membership lists  
- command-based routing  
- more complex state management  

---

## 5️⃣ Length-Prefix Binary Protocol
File: `05-length-prefixed.js`

### The Problem
TCP is a **stream**, not message-based.  
Data can arrive:

- split  
- merged  
- fragmented  
- in unpredictable boundaries

### The Solution
Implement a **custom binary protocol**:

```
[4-byte length][1-byte type][payload bytes...]
```

### Benefits:

- No more relying on newline terminators  
- No ambiguity in packet boundaries  
- Easily extensible protocol  
- Actual professional protocol engineering  

This is how real protocols (Redis, MySQL, HTTP/2, TLS) are structured.

---

## 6️⃣ Handling TCP Fragmentation Properly
File: `06/chat-server.js`

Implements:

- buffer accumulation  
- verifying if enough bytes exist for a full packet  
- extracting complete packets  
- removing processed bytes  
- safely waiting for the remaining bytes  

This prepares the server for the real world where packets arrive unpredictably.

---

## 7️⃣ Fragmentation Test Client
File: `06/fragment-client.js`

This tool:

- splits packets into random-sized byte chunks  
- sends them with delays  
- sends multiple packets glued together  
- simulates real-world TCP fragmentation  

If the server reassembles everything correctly, the protocol is sound.

---

# 🧩 Key Concepts Mastered

- TCP is a stream — not message-based  
- Fragmentation is normal and expected  
- Binary framing is mandatory for real protocols  
- Buffer handling and slicing  
- Endianness (BE vs LE)  
- Writing/read integers in buffers  
- Command parsing  
- Broadcast routing  
- Channel membership  
- Implementing packet types  

This repo is a step-by-step progression from:

> **“What is the Internet?”**  
to  
> **“I built my own binary protocol with fragmentation handling.”**

---

# ▶️ Running the Code

### Start any server:
```
node filename.js
```

### For fragmentation testing:
```
node 06/chat-server.js
node 06/fragment-client.js
```

### Use netcat for plaintext servers:
```
nc localhost 9000
```
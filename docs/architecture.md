# 🏗 LIPTunnel Architecture

LIPTunnel is a lightweight, self-hosted reverse tunnel system that exposes a local development server to the public internet using your own VPS and domain.

It works similarly to Ngrok or LocalTunnel, but with:

- No limits  
- No subscriptions  
- Full control  
- Your own branding  

This document explains the internal architecture and how the components interact.

---

# 🌐 High-Level Overview

 Public User → DNS (*.yourdomain.com) → VPS (LIPTunnel Server)
 → WebSocket Tunnel → Client Machine → localhost:<port>
 
 LIPTunnel consists of **two main components**:

1. **LIPTunnel Server** (runs on your VPS)
2. **LIPTunnel Client CLI** (runs on local machine)

They communicate using a persistent **WebSocket tunnel**.

---

# 🔌 1. LIPTunnel Server (VPS)

Location:

/server/server.js

The server:

✔ Opens HTTPS/HTTP (port 80)  
✔ Accepts WebSocket connections  
✔ Assigns random subdomains (abc123.yourdomain.com)  
✔ Maps subdomain → WebSocket client  
✔ Forwards all incoming HTTP traffic to the correct connected client  
✔ Waits for responses and forwards them back to the original requester  

### Server Responsibilities

| Function | Description |
|---------|-------------|
| Registration | Clients register with `subdomain` + `localPort` |
| Routing | Maps HTTP requests based on `Host` header |
| Tunneling | Sends requests to client over WebSocket |
| Response | Sends client response back to browser |
| Cleanup | Removes tunnels when client disconnects |

---

# 🖥 2. LIPTunnel Client (Local Machine)

Location:

/bin/liptunnel.js


The client:

✔ Creates WebSocket connection to your VPS  
✔ Registers a random subdomain  
✔ Listens for incoming "http-request" events  
✔ Forwards traffic to `http://localhost:<PORT>`  
✔ Sends back output to server  
✔ Displays a terminal dashboard  
✔ Shows a local dashboard at: `http://127.0.0.1:4040`

---

# 🔄 Request Flow (Step-by-Step)

            ┌─────────────────────────────┐
            │ 1. User opens public URL    │
            │    http://abc123.domain.com │
            └───────────────┬─────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ LIPTunnel Server    │
                 │ Receives HTTP req   │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ WebSocket Tunnel    │
                 │ Sends request to    │
                 │ correct client      │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ LIPTunnel Client    │
                 │ Local machine       │
                 │ Forwards to         │
                 │ localhost:5000      │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Local App Response  │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Sent back through   │
                 │ WebSocket           │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Server returns to   │
                 │ original requester  │
                 └─────────────────────┘


---

# 📡 WebSocket Messages (Protocol)

### Client → Server

#### Register tunnel
```json
{
  "type": "register",
  "subdomain": "abc123",
  "port": 5000
}
```

Forward response
```json
{
  "type": "http-response",
  "id": "uuid",
  "statusCode": 200,
  "headers": {},
  "body": "response-body"
}
```

Server → Client

Incoming request

```json
{
  "type": "http-request",
  "id": "uuid",
  "method": "GET",
  "url": "/path",
  "headers": {},
  "body": "post-data"
}
```

## ⚙ Subdomain Assignment

Each tunnel is given a random subdomain:

```json
Math.random().toString(36).substring(2, 8)
```

Example:
```json
g83ksd.yourdomain.com
```

DNS Requirement:
```json
*.yourdomain.com → VPS IP
```

## 🧰 Technology Stack

| Component  | Technology                    |
|-----------|--------------------------------|
| Server    | Node.js + Express + WebSocket |
| Client    | Node.js CLI                   |
| Communication | JSON over WebSocket       |
| Dashboard | Local Express server          |
| ID Generation | uuid v4                   |
| Routing   | HTTP Host header mapping      |



## 🔒 Security Notes

No eval() or unsafe parsing

Only HTTP is supported (HTTPS planned for v2)

Subdomain isolation prevents cross-tunnel interference

VPS runs behind firewall

Client never exposes system files or ports except chosen one

🛠 Future Architecture Extensions
Planned features:

🔐 HTTPS support with Let's Encrypt

🧑‍💻 Authenticated tunnels

📡 Custom reserved subdomains per user

⚡ Load-balanced multi-node architecture

🐳 Docker deployment for both client/server

📊 Web admin portal for monitoring tunnels

## 🏁 Conclusion

LIPTunnel’s architecture is simple, secure, and powerful:

- Small codebase
- Easy to maintain
- Easy for contributors
- Works on any VPS
- Fully open source
- Personal branding for Lasisi Ibrahim Pelumi

This document is ideal for:

- GitHub documentation
- Developer onboarding




#!/usr/bin/env node

/**
 * LIPTunnel – Self-Hosted Ngrok Alternative
 * Created by Lasisi Ibrahim Pelumi (Full-Stack Engineer)
 * GitHub: https://github.com/ibrahimpelumi6142
 * License: MIT
 */

const WebSocket = require("ws");
const express = require("express");
const http = require("http");
const args = process.argv.slice(2);

function banner() {
  console.log(`
  ██╗     ██╗██████╗ ████████╗██╗   ██╗███╗   ██╗██╗██╗     ███████╗███╗   ██╗
  ██║     ██║██╔══██╗╚══██╔══╝██║   ██║████╗  ██║██║██║     ██╔════╝████╗  ██║
  ██║     ██║██████╔╝   ██║   ██║   ██║██╔██╗ ██║██║██║     █████╗  ██╔██╗ ██║
  ██║     ██║██╔═══╝    ██║   ██║   ██║██║╚██╗██║██║██║     ██╔══╝  ██║╚██╗██║
  ███████╗██║██║        ██║   ╚██████╔╝██║ ╚████║██║███████╗███████╗██║ ╚████║
  ╚══════╝╚═╝╚═╝        ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝

              LIPTunnel — By Lasisi Ibrahim Pelumi (v1.1.0)
  `);
}

function usage() {
  console.log("Usage:");
  console.log("  Normal:    liptunnel http <port>");
  console.log("  Multi:     liptunnel http <port1,port2> --multi\n");
}

if (args[0] !== "http" || !args[1]) {
  banner();
  usage();
  process.exit(1);
}

// Check if multi-mode is activated
const isMultiMode = args.includes("--multi");

// Parse ports
const portArg = args[1];
const ports = portArg.includes(',') 
  ? portArg.split(',').map(p => parseInt(p.trim()))
  : [parseInt(portArg)];

// ⬇️ CHANGE THIS LINE TO YOUR DOMAIN! ⬇️
let serverHost = "yourdomain.com";  // ← PUT YOUR DOMAIN HERE

// Allow override with --server flag (optional)
const flagIndex = args.indexOf("--server");
if (flagIndex !== -1 && args[flagIndex + 1]) {
  serverHost = args[flagIndex + 1];
}

// Store all tunnels
const tunnels = [];

// Create tunnel for each port
ports.forEach((localPort, index) => {
  const subdomain = Math.random().toString(36).substring(2, 8);
  const ws = new WebSocket(`ws://${serverHost}`);
  const logs = [];

  function dashboard() {
    console.clear();
    banner();
    
    if (isMultiMode && ports.length > 1) {
      // MULTI MODE - Show "Forwarding 1", "Forwarding 2", etc.
      console.log("Multi-Tunnel Mode: Active\n");
      tunnels.forEach((t, idx) => {
        console.log(`Forwarding ${idx + 1}: http://${t.subdomain}.${serverHost} → http://localhost:${t.port}`);
      });
    } else {
      // NORMAL MODE - Show "Forwarding" (like old version)
      tunnels.forEach(t => {
        console.log("Status: Online");
        console.log(`Forwarding: http://${t.subdomain}.${serverHost} → http://localhost:${t.port}`);
      });
    }
    
    console.log("\nLocal Dashboard: http://127.0.0.1:4040\n");
    console.log("Recent HTTP Requests:");
    logs.slice(-10).forEach(l => console.log(l));
  }

  ws.on("open", () => {
    ws.send(JSON.stringify({ type: "register", subdomain, port: localPort }));
    const tunnel = { subdomain, port: localPort, ws, logs };
    tunnels.push(tunnel);
    dashboard();
  });

  ws.on("message", async (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "http-request") {
      const options = { method: data.method, headers: data.headers };

      const req = http.request(`http://localhost:${localPort}${data.url}`, options, (res) => {
        let body = "";

        res.on("data", chunk => body += chunk);
        res.on("end", () => {
          ws.send(JSON.stringify({
            type: "http-response",
            id: data.id,
            statusCode: res.statusCode,
            headers: res.headers,
            body
          }));

          const now = new Date();
          const logPrefix = isMultiMode && ports.length > 1 ? `[${subdomain}]` : '';
          logs.push(`${now.toISOString()} ${logPrefix} ${data.method} ${data.url} ${res.statusCode}`);
          dashboard();
        });
      });

      req.on("error", (err) => {
        ws.send(JSON.stringify({
          type: "http-response",
          id: data.id,
          statusCode: 502,
          headers: { "content-type": "text/plain" },
          body: "Proxy Error: " + err.message
        }));

        const logPrefix = isMultiMode && ports.length > 1 ? `[${subdomain}]` : '';
        logs.push(`${new Date().toISOString()} ${logPrefix} ERROR 502`);
        dashboard();
      });

      if (data.body) req.write(data.body);
      req.end();
    }
  });

  ws.on("close", () => console.log(`❌ Tunnel closed: ${subdomain}`));
  ws.on("error", (e) => console.log(`WebSocket Error:`, e.message));
});

express()
  .get("/", (req, res) => {
    let html = '<h1>LIPTunnel Dashboard</h1>';
    
    if (isMultiMode && ports.length > 1) {
      html += '<p><strong>Multi-Tunnel Mode: Active</strong></p>';
      tunnels.forEach((t, idx) => {
        html += `
          <h2>Tunnel ${idx + 1}</h2>
          <p>Public: http://${t.subdomain}.${serverHost}</p>
          <p>Local: http://localhost:${t.port}</p>
          <hr>
          <pre>${t.logs.join("\n")}</pre>
        `;
      });
    } else {
      tunnels.forEach(t => {
        html += `
          <p>Public URL: http://${t.subdomain}.${serverHost}</p>
          <pre>${t.logs.join("\n")}</pre>
        `;
      });
    }
    
    res.send(html);
  })
  .listen(4040);

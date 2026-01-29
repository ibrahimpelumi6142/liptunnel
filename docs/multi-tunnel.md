## 🚀 Multi-Tunnel Support (v1.1.0+)

### Tunnel Multiple Services Simultaneously

Perfect for microservices development, frontend + backend, or any scenario where you need to expose multiple local ports.

#### Basic Multi-Tunnel Usage

```bash
# Tunnel 3 services at once
liptunnel http 3000,8080,5000 --server yourdomain.com
```

**Output:**
```
═══════════════════════════════════════════════════════════════
ACTIVE TUNNELS
═══════════════════════════════════════════════════════════════

🟢 Tunnel: tunnel1-abc123
   Public:  http://tunnel1-abc123.yourdomain.com
   Local:   http://localhost:3000
   Stats:   15 requests, 0 errors
   Active:  1/22/2026, 2:30:45 PM

🟢 Tunnel: tunnel2-def456
   Public:  http://tunnel2-def456.yourdomain.com
   Local:   http://localhost:8080
   Stats:   8 requests, 0 errors
   Active:  1/22/2026, 2:30:42 PM

🟢 Tunnel: tunnel3-ghi789
   Public:  http://tunnel3-ghi789.yourdomain.com
   Local:   http://localhost:5000
   Stats:   3 requests, 0 errors
   Active:  1/22/2026, 2:30:38 PM
```

#### Named Tunnels

Use the `--name` flag for readable, memorable URLs:

```bash
liptunnel http 3000 --name api --server yourdomain.com
# Creates: http://api.yourdomain.com → http://localhost:3000
```

#### Dashboard

View all active tunnels in your browser:

```bash
# Open in browser
http://127.0.0.1:4040
```

**Dashboard Features:**
- Real-time tunnel status (auto-refreshes every 5 seconds)
- Per-tunnel statistics (request count, errors, last activity)
- Recent request logs across all tunnels
- Color-coded HTTP methods and status codes
- REST API at `/api/tunnels` for programmatic access

### Use Cases

#### Microservices Development
```bash
# Backend API, Frontend, and WebSocket server
liptunnel http 3000,8080,3001 --server yourdomain.com

# Access them:
# http://tunnel1-xxx.yourdomain.com  → Backend API
# http://tunnel2-xxx.yourdomain.com  → Frontend
# http://tunnel3-xxx.yourdomain.com  → WebSocket server
```

#### Full-Stack Development
```bash
# Run your entire stack with one command
liptunnel http 3000,5000,5432 --server yourdomain.com

# 3000  → Next.js frontend
# 5000  → Express.js API
# 5432  → PostgreSQL admin panel
```

#### Mobile App Development
```bash
# Expose API and webhook endpoints for mobile testing
liptunnel http 8000,8001 --server yourdomain.com

# 8000 → Main API
# 8001 → Webhook receiver
```

### API Access

Query tunnel status programmatically:

```bash
curl http://127.0.0.1:4040/api/tunnels
```

**Response:**
```json
[
  {
    "subdomain": "tunnel1-abc123",
    "port": 3000,
    "status": "online",
    "stats": {
      "requests": 15,
      "errors": 0,
      "lastActivity": "2026-01-22T14:30:45.123Z"
    }
  },
  {
    "subdomain": "tunnel2-def456",
    "port": 8080,
    "status": "online",
    "stats": {
      "requests": 8,
      "errors": 0,
      "lastActivity": "2026-01-22T14:30:42.456Z"
    }
  }
]
```

### Command Reference

```bash
# Single tunnel (backward compatible)
liptunnel http <port> --server <domain>

# Multiple tunnels
liptunnel http <port1,port2,port3> --server <domain>

# Named tunnel
liptunnel http <port> --name <name> --server <domain>
```

**Examples:**
```bash
# One tunnel
liptunnel http 3000 --server mytunnel.com

# Three tunnels
liptunnel http 3000,8080,5000 --server mytunnel.com

# Named tunnel
liptunnel http 3000 --name api --server mytunnel.com
```

### Tips & Best Practices

1. **Organize by purpose**: Use named tunnels for important services
   ```bash
   liptunnel http 3000 --name api --server yourdomain.com
   ```

2. **Monitor your tunnels**: Keep the dashboard open to track activity
   ```bash
   # Dashboard URL
   http://127.0.0.1:4040
   ```

3. **Graceful shutdown**: Use `Ctrl+C` to close all tunnels cleanly
   ```
   Shutting down all tunnels...
   ❌ Tunnel closed: tunnel1-abc123
   ❌ Tunnel closed: tunnel2-def456
   ```

4. **Port conflicts**: Ensure local services are running before starting tunnels
   ```bash
   # Check if port is in use
   lsof -i :3000
   ```

### Comparison: v1.0.0 vs v1.1.0

| Feature | v1.0.0 | v1.1.0 |
|---------|--------|---------|
| Single tunnel | ✅ | ✅ |
| Multiple tunnels | ❌ | ✅ |
| Named tunnels | ❌ | ✅ |
| Per-tunnel stats | ❌ | ✅ |
| Enhanced dashboard | ❌ | ✅ |
| REST API | ❌ | ✅ |
| Backward compatible | - | ✅ |

### Troubleshooting Multi-Tunnel

**Issue: "Port already in use"**
```bash
# Check what's using the port
lsof -i :3000

# Kill the process if needed
kill -9 <PID>
```

**Issue: "Can't connect to tunnel"**
- Verify local service is running: `curl http://localhost:3000`
- Check tunnel status in dashboard: `http://127.0.0.1:4040`
- Review logs in the terminal

**Issue: "Too many open files"**
```bash
# Increase file descriptor limit
ulimit -n 4096
```

### Performance Notes

- **Memory**: ~10MB per additional tunnel
- **Latency**: <5ms overhead per tunnel
- **Recommended**: Up to 10 concurrent tunnels for optimal performance
- **Tested**: Successfully handles 100+ requests/second across 5 tunnels

---

## Migration from v1.0.0

**Good news**: v1.1.0 is fully backward compatible! All your v1.0.0 commands work unchanged.

**Before (v1.0.0):**
```bash
# Need 3 terminal windows
liptunnel http 3000 --server yourdomain.com
liptunnel http 8080 --server yourdomain.com  
liptunnel http 5000 --server yourdomain.com
```

**After (v1.1.0):**
```bash
# Just one terminal window
liptunnel http 3000,8080,5000 --server yourdomain.com
```

No changes needed to your existing scripts or workflows! 🎉

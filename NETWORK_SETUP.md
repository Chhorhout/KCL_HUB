# Network Access Configuration Guide

## Overview
Both frontend and backend have been configured to allow access from other machines on your local network. The frontend automatically detects whether it's being accessed via `localhost` or an IP address and adjusts API endpoints accordingly.

## Frontend Configuration

### Vite Configuration (`vite.config.ts`)
- **Host**: Set to `true` - exposes the dev server to the network
- **Port**: `5000`
- The server will be accessible at:
  - `http://localhost:5000` (local access)
  - `http://YOUR_IP:5000` (network access)

### API Configuration (`src/config/api.ts`)
- Automatically detects the hostname/IP from `window.location.hostname`
- **When accessed via localhost**: Uses `http://localhost` for APIs
- **When accessed via IP**: Uses `http://YOUR_IP` for APIs
- All API endpoints are dynamically configured based on how the frontend is accessed

### API Ports
- **IDP API (Authentication)**: Port `5165`
- **AMS API**: Port `5092`
- **HRMS API**: Port `5045`

## Backend Configuration

### Required Backend Setup
Ensure all three backend APIs are configured to listen on `0.0.0.0`:

1. **IDP API** (`IDP/IDP.Api/Program.cs`):
   - Listen on: `http://0.0.0.0:5165` and `https://0.0.0.0:7026`
   - CORS configured for frontend on port 5000

2. **AMS API** (`AMS/AMS.Api/Program.cs`):
   - Listen on: `http://0.0.0.0:5092`
   - CORS configured for frontend on port 5000

3. **HRMS API** (`HRMS/HRMS.API/Program.cs`):
   - Listen on: `http://0.0.0.0:5045`
   - CORS configured for frontend on port 5000

## How to Access from Other Machines

### Step 1: Find Your PC's IP Address
1. Open Command Prompt or PowerShell
2. Run: `ipconfig`
3. Look for "IPv4 Address" (e.g., `192.168.1.100`)

### Step 2: Start All Services

**Backend APIs:**
```bash
# In separate terminals, navigate to each API project and run:
cd IDP/IDP.Api
dotnet run

cd AMS/AMS.Api
dotnet run

cd HRMS/HRMS.API
dotnet run
```

**Frontend:**
```bash
npm run dev
```

The frontend will show:
```
  Local:   http://localhost:5000/
  Network: http://192.168.x.x:5000/
```

### Step 3: Access from Other Machines
1. Ensure all devices are on the same network
2. Open a browser on another machine
3. Navigate to: `http://YOUR_IP:5000`
   - Example: `http://192.168.1.100:5000`

## Important Notes

### Firewall Configuration
- **Windows Firewall**: Ensure ports `5000`, `5165`, `5092`, and `5045` are allowed for incoming connections
- To allow ports:
  1. Open Windows Defender Firewall
  2. Click "Advanced settings"
  3. Click "Inbound Rules" → "New Rule"
  4. Select "Port" → Next
  5. Enter the port number → Next
  6. Allow the connection → Next
  7. Apply to all profiles → Next
  8. Name it (e.g., "Frontend Dev Server") → Finish

### Network Requirements
- All devices must be on the same local network (same router/switch)
- The development machine must have a static or known IP address
- If using DHCP, the IP may change - consider setting a static IP

### Testing
1. **Local Test**: Access `http://localhost:5000` - should work normally
2. **Network Test**: Access `http://YOUR_IP:5000` from another machine - should automatically use IP-based API endpoints

## Troubleshooting

### Cannot Access from Other Machines
1. **Check Firewall**: Ensure Windows Firewall allows connections on port 5000
2. **Check IP Address**: Verify your IP hasn't changed (`ipconfig`)
3. **Check Network**: Ensure both machines are on the same network
4. **Check Backend**: Verify all backend APIs are running and accessible

### API Connection Errors
1. **Check Browser Console**: Open DevTools (F12) → Console tab
2. **Check Network Tab**: See which API endpoints are being called
3. **Verify API URLs**: Should match your IP when accessed from network
4. **Check Backend CORS**: Ensure CORS policies allow your IP address

### Backend Not Accessible
1. **Verify Backend is Running**: Check terminal output for "Now listening on..."
2. **Check Backend CORS**: Ensure CORS allows `http://YOUR_IP:5000`
3. **Test Direct API Access**: Try `http://YOUR_IP:5165/api/roles` in browser

## Example Configuration

If your PC's IP is `192.168.1.100`:

- **Frontend**: `http://192.168.1.100:5000`
- **IDP API**: `http://192.168.1.100:5165/api`
- **AMS API**: `http://192.168.1.100:5092/api`
- **HRMS API**: `http://192.168.1.100:5045/api`

When users access the frontend at `http://192.168.1.100:5000`, all API calls will automatically use `http://192.168.1.100` as the base URL.

## Files Updated

All frontend files have been updated to use the centralized API configuration:
- `src/config/api.ts` - Central API configuration
- `src/contexts/AuthContext.tsx` - Uses API config
- All page components - Use API config instead of hardcoded URLs
- `vite.config.ts` - Configured for network access

# CORS Configuration for Network Access

## Problem
The backend API is accessible (as shown by successful Postman/API client tests), but the frontend cannot connect due to CORS restrictions.

## Solution: Update Backend CORS Configuration

You need to update the CORS policy in all three backend APIs to allow requests from your IP address.

### Update IDP API (`IDP/IDP.Api/Program.cs`)

Find the CORS configuration and add your IP address:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost5000", builder =>
    {
        builder.WithOrigins(
            "http://localhost:5000",
            "http://192.168.2.214:5000",        // Add your IP here
            "http://192.168.189.1:5000",        // Keep existing IPs
            "http://192.168.2.214:5000"         // Keep existing IPs
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        .WithExposedHeaders("X-Total-Count", "X-Total-Pages", "X-Current-Page", "X-Page-Size");
    });
});
```

### Update AMS API (`AMS/AMS.Api/Program.cs`)

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost5000", builder =>
    {
        builder.WithOrigins(
            "http://localhost:5000",
            "http://192.168.2.214:5000",        // Add your IP here
            "http://192.168.189.1:5000",        // Keep existing IPs
            "http://192.168.2.214:5000"         // Keep existing IPs
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        .WithExposedHeaders("X-Total-Count", "X-Total-Pages", "X-Current-Page", "X-Page-Size");
    });
});
```

### Update HRMS API (`HRMS/HRMS.API/Program.cs`)

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost5000", builder =>
    {
        builder.WithOrigins(
            "http://localhost:5000",
            "http://192.168.2.214:5000",        // Add your IP here
            "http://192.168.189.1:5000",        // Keep existing IPs
            "http://192.168.2.214:5000"         // Keep existing IPs
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        .WithExposedHeaders("X-Total-Count", "X-Total-Pages", "X-Current-Page", "X-Page-Size");
    });
});
```

## Alternative: Dynamic CORS (For Development)

If your IP changes frequently, you can use a more flexible CORS configuration:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost5000", builder =>
    {
        builder.SetIsOriginAllowed(origin => 
        {
            // Allow localhost
            if (origin.StartsWith("http://localhost:5000"))
                return true;
            
            // Allow any IP on port 5000 (for development only)
            if (origin.StartsWith("http://192.168.") && origin.EndsWith(":5000"))
                return true;
            
            // Allow specific IPs
            return origin == "http://192.168.189.1:5000" ||
                   origin == "http://192.168.2.214:5000";
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        .WithExposedHeaders("X-Total-Count", "X-Total-Pages", "X-Current-Page", "X-Page-Size");
    });
});
```

## Steps to Apply

1. **Update all three `Program.cs` files** with your IP address (`192.168.2.214:5000`)

2. **Restart all backend APIs:**
   ```bash
   # Stop current instances (Ctrl+C)
   # Then restart each API
   cd IDP/IDP.Api
   dotnet run
   
   cd AMS/AMS.Api
   dotnet run
   
   cd HRMS/HRMS.API
   dotnet run
   ```

3. **Test from frontend:**
   - Access frontend at `http://192.168.2.214:5000`
   - Try logging in
   - Check browser console (F12) for any CORS errors

## Verify CORS is Working

**Check Browser DevTools (F12):**
1. Go to **Network** tab
2. Try to login
3. Look at the request headers:
   - Should see `Origin: http://192.168.2.214:5000`
4. Look at the response headers:
   - Should see `Access-Control-Allow-Origin: http://192.168.2.214:5000`
   - Should see `Access-Control-Allow-Credentials: true`

**If you see CORS errors:**
- Check that the origin exactly matches (including `http://` and `:5000`)
- Ensure backend was restarted after CORS changes
- Check that `AllowCredentials()` is called if using cookies/auth headers

## Quick Test

After updating CORS, test with curl:

```bash
curl -X OPTIONS http://192.168.2.214:5165/api/auth/login \
  -H "Origin: http://192.168.2.214:5000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v
```

Look for `Access-Control-Allow-Origin: http://192.168.2.214:5000` in the response headers.


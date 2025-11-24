# Backend CORS Configuration for Network Access

## Quick Setup for All Three APIs

Update the CORS configuration in each API's `Program.cs` file:

### IDP API (Authentication) - Port 5165

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNetwork",
        builder =>
        {
            builder.SetIsOriginAllowed(origin => 
                {
                    // Allow localhost and local network IPs
                    return origin.StartsWith("http://localhost") ||
                           origin.StartsWith("http://192.168.") ||
                           origin.StartsWith("http://10.") ||
                           origin.StartsWith("http://172.16.");
                })
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithExposedHeaders("X-Total-Count", "X-Total-Pages", "X-Current-Page", "X-Page-Size");
        });
});

var app = builder.Build();

// ... seeding code ...

// CORRECT MIDDLEWARE ORDER:
app.UseRouting();
app.UseCors("AllowNetwork");
app.MapControllers();
app.UseStaticFiles();

app.Run();
```

### AMS API - Port 5092

Same configuration as above, just change the policy name if needed.

### HRMS API - Port 5045

Same configuration as above.

## Configure Kestrel to Listen on All Interfaces

Add this to each `Program.cs` before `var app = builder.Build();`:

```csharp
// Listen on all network interfaces
builder.WebHost.UseKestrel(options =>
{
    // For IDP API
    options.ListenAnyIP(5165);
    
    // For AMS API (use 5092)
    // options.ListenAnyIP(5092);
    
    // For HRMS API (use 5045)
    // options.ListenAnyIP(5045);
});
```

## Alternative: Update launchSettings.json

In `Properties/launchSettings.json` for each API:

```json
{
  "profiles": {
    "http": {
      "applicationUrl": "http://0.0.0.0:5165"
    }
  }
}
```

## Testing

1. Start all three backend APIs
2. Start frontend: `npm run dev`
3. Note the Network URL (e.g., `http://192.168.2.214:5000`)
4. Share this URL with other users
5. They can access the app and APIs will automatically use the correct IP


# CORS Headers Fix Guide

## Problem
The pagination headers (`X-Total-Count`, `X-Total-Pages`, `X-Current-Page`, `X-Page-Size`) are being sent by the server but are **not accessible** in JavaScript (axios/fetch) due to CORS restrictions.

## Why This Happens
By default, browsers only expose a limited set of response headers to JavaScript for security reasons. Custom headers must be explicitly exposed using the `Access-Control-Expose-Headers` header.

## Solution: Add to Your ASP.NET Core API

### Option 1: In your CORS configuration (Recommended)

```csharp
// In Program.cs or Startup.cs

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", policy =>
    {
        policy.WithOrigins("http://localhost:5000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithExposedHeaders("X-Total-Count", "X-Total-Pages", "X-Current-Page", "X-Page-Size");
    });
});

// Then use it:
app.UseCors("AllowLocalhost");
```

### Option 2: Using middleware (if you need more control)

```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("Access-Control-Expose-Headers", 
        "X-Total-Count, X-Total-Pages, X-Current-Page, X-Page-Size");
    await next();
});
```

### Option 3: In your controller action (if using attribute-based CORS)

```csharp
[HttpGet]
[EnableCors("AllowLocalhost")]
public async Task<IActionResult> GetDepartments([FromQuery] int page = 1, [FromQuery] int pageSize = 4)
{
    // Your pagination logic here
    
    Response.Headers.Add("X-Total-Count", totalCount.ToString());
    Response.Headers.Add("X-Total-Pages", totalPages.ToString());
    Response.Headers.Add("X-Current-Page", page.ToString());
    Response.Headers.Add("X-Page-Size", pageSize.ToString());
    
    return Ok(departments);
}
```

## Verify the Fix
After adding the `Access-Control-Expose-Headers` header:
1. Check the Network tab in browser DevTools
2. Look for `Access-Control-Expose-Headers` in the Response Headers
3. The headers should now be accessible in `response.headers` in your JavaScript code

## Current Workaround
The code currently uses a fallback that calculates pagination from the data length if headers aren't accessible. This works but isn't ideal for server-side pagination with large datasets.


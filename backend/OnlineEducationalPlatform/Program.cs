using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;    
using OnlineEducationaAPI.Data;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDBContext>(options =>
    //options.UseSqlServer(Environment.GetEnvironmentVariable("DB_CONNECTION_STRING"))
    options.UseSqlServer("Server=DESKTOP-BFRCE9I;Database=OnlineEducational;Trusted_Connection=True;TrustServerCertificate=True;")
);
/* For PROD, Keep out yet
builder.Services.AddRateLimiter(options =>
{
options.AddPolicy("PerIpPolicy", context =>
{
    var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

    return RateLimitPartition.GetFixedWindowLimiter(ipAddress, _ => new FixedWindowRateLimiterOptions
    {
        PermitLimit = 100, // 100 requests
        Window = TimeSpan.FromMinutes(1), // per 1 minute
        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
        QueueLimit = 0 // Drop extra requests
    });
    options.RejectionStatusCode = 429;
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.Headers["Retry-After"] = "60";
        await context.HttpContext.Response.WriteAsync("Too many requests. Try again later.", cancellationToken: token);
    };
});
*/
builder.Services.AddControllers();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidIssuer = Environment.GetEnvironmentVariable("ISSUER") ?? "CoolIssuer",
        ValidateAudience = false,
        ValidAudience = Environment.GetEnvironmentVariable("CLIENT_URL") ?? "*",
        ValidateLifetime = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("SIGNING_KEY") ?? "VeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKey")),
        ValidateIssuerSigningKey = false,
        RoleClaimType = ClaimTypes.Role
    };
});

// Set Up CORS Policy
// For PROD, Edit with specific origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod(); // Restrict headers
    });
});

// Configure User Secrets
WebApplication app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error");
}

// Automate Migrations
 using (var scope = app.Services.CreateScope())
 {
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<ApplicationDBContext>();
        dbContext.Database.Migrate(); // Apply pending migrations automatically
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database migration failed: {ex.Message}");
    }
}

app.UseHttpsRedirection();

app.Use(async (context, next) =>
{

    context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0";
    context.Response.Headers["Pragma"] = "no-cache";
    context.Response.Headers["Expires"] = "0";

    await next();
});

app.UseRouting();

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
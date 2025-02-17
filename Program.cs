using OnlineEducationaAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;    
using System.Text;
using OnlineEducationaAPI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using DotNetEnv;

using Microsoft.Extensions.Logging;
using Serilog;
using System.IO;

Env.Load();
var logDirectory = Path.Combine(AppContext.BaseDirectory, "Logs");
if (!Directory.Exists(logDirectory))
{
    Directory.CreateDirectory(logDirectory);
}
var logFilePath = Path.Combine(logDirectory, "app.log");


// Configure Serilog for logging
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .WriteTo.Console() // Show logs in console
    .WriteTo.File(logFilePath, rollingInterval: RollingInterval.Day, retainedFileCountLimit: 7)
    .CreateLogger();


var builder = WebApplication.CreateBuilder(args);
var SECRET_KEY = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
                 ?? throw new Exception("JWT Secret Key is missing");
builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddControllers(mvcOptions =>
{
    mvcOptions.InputFormatters.Add(new TextSingleValueFormatter());
});



// Set Up Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Set Up Application Database Context
var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
                     ?? throw new Exception("Database connection string missing!");

builder.Services.AddDbContext<ApplicationDBContext>(options =>
    options.UseSqlServer(connectionString));

// Set Up Authentication with JSON Web Tokens.
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER"),
        ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
        ClockSkew = TimeSpan.FromMinutes(5),
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SECRET_KEY))
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"Token failed validation, reason: {context.Exception.Message}");
            return Task.CompletedTask;
        }
    };
});

// Add custom authorization policies, to require admin and require instructor.
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy =>
    {
        policy.Requirements.Add(new RoleRequirement("Admin"));
    });
    options.AddPolicy("RequireInstructor", policy =>
    {
        policy.Requirements.Add(new RoleRequirement("Instructor"));
    });
    options.AddPolicy("RequireEither", policy =>
    {
        policy.Requirements.Add(new RoleRequirement("Either"));
    });
});
builder.Services.AddScoped<IAuthorizationHandler, RoleAuthorizationHandler>();

// Set Up CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("https://learn.gustavolacruz.com", "https://gscruz627.bsite.net") // Specify allowed domain
        .WithMethods("GET", "POST", "PATCH", "DELETE") // Restrict methods
        .WithHeaders("Authorization", "Content-Type"); // Restrict headers
    });
});

// Configure User Secrets
builder.Configuration.AddUserSecrets<Program>();

try
{

    // Create the Application and configure middleware
    var app = builder.Build();
    Log.Information("application started successfully");
    app.UseCors("AllowAll");

    // Configure the HTTP request pipeline.
    if (!app.Environment.IsDevelopment())
    {
        app.UseExceptionHandler(errorApp =>
        {
            errorApp.Run(async context =>
            {
                context.Response.StatusCode = 500; // Internal Server Error
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"error\": \"An unexpected error occurred.\"}");
            });
        });
    }

    app.UseHttpsRedirection();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

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

    // Run This Application
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed to start!");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
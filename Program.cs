using OnlineEducationaAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;    
using System.Text;
using Microsoft.AspNetCore.Cors;
using OnlineEducationaAPI;
using Microsoft.AspNetCore.Authorization;


var builder = WebApplication.CreateBuilder(args);
var SECRET_KEY = builder.Configuration["jwt:secret_key"];

// Add services to the container.
builder.Services.AddControllers(mvcOptions =>
{
    mvcOptions.InputFormatters.Add(new TextSingleValueFormatter());
});

// Set Up Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Set Up Application Database Context
builder.Services.AddDbContext<ApplicationDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Set Up Authentication with JSON Web Tokens.
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
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
        policy.AllowAnyOrigin() // Allows requests from any origin
              .AllowAnyMethod() // Allows any HTTP method (GET, POST, etc.)
              .AllowAnyHeader(); // Allows any headers
    });
});

// Configure User Secrets
builder.Configuration.AddUserSecrets<Program>();

// Create the Application and configure middleware
var app = builder.Build();
app.UseCors("AllowAll");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Run This Application
app.Run();

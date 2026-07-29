using API.Middleware;
using Application;
using Domain.Interfaces;
using Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Serilog;
using System.Globalization;
using System.Text;
using System.Threading.RateLimiting;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting BookingClone API");

    var builder = WebApplication.CreateBuilder(args);
    // Local overrides sit below environment variables so env vars (e.g. from Docker/.env) always win.
    builder.Configuration
        .AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true)
        .AddEnvironmentVariables();

    builder.Host.UseSerilog((context, config) =>
        config.ReadFrom.Configuration(context.Configuration)
              .Enrich.FromLogContext());

    builder.Services.AddInfrastructure(builder.Configuration);
    builder.Services.AddApplication();
    
    var jwtKey = builder.Configuration["Jwt:Key"]
        ?? throw new InvalidOperationException("Jwt:Key is not configured");

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                ValidateIssuer = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = builder.Configuration["Jwt:Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.ReferenceHandler =
                System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
            options.JsonSerializerOptions.Converters.Add(
                new System.Text.Json.Serialization.JsonStringEnumConverter());
        });
    builder.Services.AddEndpointsApiExplorer();

    builder.Services.AddOpenApi(options =>
    {
        options.AddDocumentTransformer((document, context, cancellationToken) =>
        {
            // Ensure instances exist
            document.Components ??= new OpenApiComponents();
            document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();

            document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Name = "Authorization",
                Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\""
            };

            document.Security = [
                new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecuritySchemeReference("Bearer"),
                    []
                }
            }
            ];

            document.SetReferenceHostDocument();

            document.Servers = [
                new OpenApiServer
            {
                Url = builder.Configuration["ServerRunUrl"]
            }
            ];

            return Task.CompletedTask;
        });
    });


    var frontendOrigins = (builder.Configuration["Frontend:Url"] ?? "http://localhost:5173")
        .Split(' ', StringSplitOptions.RemoveEmptyEntries);

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("FrontendPolicy", policy =>
            policy.WithOrigins(frontendOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod());
    });

    var authRateLimitPermitLimit = builder.Configuration.GetValue("RateLimiting:Auth:PermitLimit", 5);
    var authRateLimitWindowSeconds = builder.Configuration.GetValue("RateLimiting:Auth:WindowSeconds", 60);
    var authRateLimitQueueLimit = builder.Configuration.GetValue("RateLimiting:Auth:QueueLimit", 0);

    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

        options.OnRejected = async (context, cancellationToken) =>
        {
            context.HttpContext.Response.Headers.RetryAfter =
                authRateLimitWindowSeconds.ToString(CultureInfo.InvariantCulture);
            await context.HttpContext.Response.WriteAsJsonAsync(
                new { message = "Too many requests. Please try again later." },
                cancellationToken);
        };

        options.AddPolicy("auth", context =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = authRateLimitPermitLimit,
                    Window = TimeSpan.FromSeconds(authRateLimitWindowSeconds),
                    QueueLimit = authRateLimitQueueLimit,
                }));
    });

    var app = builder.Build();

    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "v1");
        options.OAuthUsePkce();
    });

    app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
    app.UseSerilogRequestLogging();
    app.UseCors("FrontendPolicy");
    app.UseStaticFiles();
    app.UseAuthentication();
    app.UseAuthorization();
    app.UseRateLimiter();
    app.MapControllers();

    await app.Services.GetRequiredService<IScopeCoveredDbInicializer>().InitializeAsync();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

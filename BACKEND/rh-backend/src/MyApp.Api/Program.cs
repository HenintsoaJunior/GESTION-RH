using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyApp.Api.Data;
using MyApp.Api.Extensions;
using MyApp.Api.Utils.generator;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.HttpOverrides;
using MyApp.Api.Models.classes.notifications;
using Hangfire;
using MyApp.Api.Services.mission;
using MyApp.Api.Services.recruitment;

var builder = WebApplication.CreateBuilder(args);
// string frontUrl = "http://10.0.105.194:5173";
string frontUrl = "http://localhost:5173";

if (OperatingSystem.IsLinux())
{
    AppContext.SetSwitch("System.Drawing.EnableUnixSupport", true);
}

var frontendUrl = builder.Configuration["API_FRONT"];
builder.WebHost.UseUrls(
    "http://0.0.0.0:5183"
);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {

        policy.WithOrigins(frontendUrl ?? frontUrl)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = 
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddScoped<ISequenceGenerator, SequenceGenerator>();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.RegisterServicesAndRepositories();
builder.Services.AddAllEnumDescriptionConverters();

builder.Services.AddHttpClient<MyApp.Api.Services.currency.ICurrencyService, MyApp.Api.Services.currency.CurrencyService>();
builder.Services.AddScoped<EmailSender>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured"))),
        RoleClaimType = System.Security.Claims.ClaimTypes.Role
    };

    options.Events = new JwtBearerEvents
    {
        OnChallenge = context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = 401;
            context.Response.ContentType = "application/json";
            var json = new { data = (object?)null, status = 401, message = "unauthorized" };
            return context.Response.WriteAsync(JsonSerializer.Serialize(json));
        },
        OnForbidden = context =>
        {
            context.Response.StatusCode = 403;
            context.Response.ContentType = "application/json";
            var json = new { data = (object?)null, status = 403, message = "forbidden" };
            return context.Response.WriteAsync(JsonSerializer.Serialize(json));
        }
    };
});

builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHangfireServer();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();
builder.Services.AddMemoryCache();
builder.Services.AddHostedService<MissionStatusBackgroundService>();
// Seed pour le recrutement
builder.Services.AddScoped<RecruitmentSeedService>();

var app = builder.Build();

app.UseHangfireDashboard("/hangfire");

ServiceProviderAccessor.Initialize(app.Services);

RecurringJob.AddOrUpdate(
    "update-mission-statuses",
    () => MissionStatusUpdater.UpdateMissionStatuses(),
    Cron.Minutely);

using (var scope = app.Services.CreateScope()) {
    var seed = scope.ServiceProvider.GetRequiredService<RecruitmentSeedService>();
    await seed.SeedAllAsync();
}

app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
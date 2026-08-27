using BusinessTwin.Application.Common.Interfaces;
using BusinessTwin.Infrastructure.Persistence;
using BusinessTwin.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BusinessTwin.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            var isTesting = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Testing" 
                         || Environment.GetEnvironmentVariable("USE_INMEMORY_DB") == "true"
                         || configuration.GetValue<bool>("UseInMemoryDb");

            var useSqlite = configuration.GetValue<bool>("UseSqlite")
                         || Environment.GetEnvironmentVariable("USE_SQLITE") == "true";

            if (isTesting)
            {
                options.UseInMemoryDatabase("BusinessTwinDb");
            }
            else if (useSqlite || string.IsNullOrEmpty(connectionString) || connectionString.Contains(".db") || connectionString.Contains("Data Source="))
            {
                var sqliteConn = configuration.GetConnectionString("Sqlite") ?? "Data Source=business_twin.db";
                options.UseSqlite(sqliteConn);
            }
            else
            {
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorCodesToAdd: null);
                });
            }
        });

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<ICurrentTenantService, CurrentTenantService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();

        // Redis cache configuration with graceful fallback
        var redisConn = configuration.GetConnectionString("Redis");
        var useInMemoryCache = configuration.GetValue<bool>("UseInMemoryCache") 
                            || Environment.GetEnvironmentVariable("USE_INMEMORY_CACHE") == "true"
                            || configuration.GetValue<bool>("UseInMemoryDb");

        if (!useInMemoryCache && !string.IsNullOrWhiteSpace(redisConn) && !redisConn.StartsWith("redis:6379"))
        {
            try
            {
                services.AddStackExchangeRedisCache(options =>
                {
                    options.Configuration = redisConn;
                    options.InstanceName = "BusinessTwin_";
                });
            }
            catch
            {
                services.AddDistributedMemoryCache();
            }
        }
        else
        {
            services.AddDistributedMemoryCache();
        }

        services.AddSingleton<IRedisCacheService, RedisCacheService>();

        // HTTP client for Python AI service with fallback
        var aiBaseUrl = configuration["AiService:BaseUrl"] ?? "http://localhost:8000";
        services.AddHttpClient("AiServiceClient", client =>
        {
            client.BaseAddress = new Uri(aiBaseUrl);
            client.Timeout = TimeSpan.FromSeconds(20);
            var apiKey = configuration["AiService:ApiKey"] ?? "internal-secret-service-token-12345";
            client.DefaultRequestHeaders.Add("X-API-KEY", apiKey);
        });

        return services;
    }
}

using BusinessTwin.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;
using System.Text.Json;

namespace BusinessTwin.Infrastructure.Services;

public class RedisCacheService : IRedisCacheService
{
    private readonly IDistributedCache? _distributedCache;
    private readonly ILogger<RedisCacheService> _logger;
    private static readonly ConcurrentDictionary<string, (string Data, DateTime Expiry)> _inMemoryFallback = new();

    public RedisCacheService(ILogger<RedisCacheService> logger, IDistributedCache? distributedCache = null)
    {
        _logger = logger;
        _distributedCache = distributedCache;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_distributedCache != null)
            {
                var cached = await _distributedCache.GetStringAsync(key, cancellationToken);
                if (!string.IsNullOrEmpty(cached))
                {
                    return JsonSerializer.Deserialize<T>(cached);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis connection failed. Falling back to in-memory cache for key {Key}", key);
        }

        // Fallback to in-memory dictionary
        if (_inMemoryFallback.TryGetValue(key, out var item))
        {
            if (DateTime.UtcNow < item.Expiry)
            {
                return JsonSerializer.Deserialize<T>(item.Data);
            }
            _inMemoryFallback.TryRemove(key, out _);
        }

        return default;
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default)
    {
        var exp = expiry ?? TimeSpan.FromMinutes(15);
        var json = JsonSerializer.Serialize(value);

        try
        {
            if (_distributedCache != null)
            {
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = exp
                };
                await _distributedCache.SetStringAsync(key, json, options, cancellationToken);
                return;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis set failed. Writing to in-memory fallback for key {Key}", key);
        }

        _inMemoryFallback[key] = (json, DateTime.UtcNow.Add(exp));
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_distributedCache != null)
            {
                await _distributedCache.RemoveAsync(key, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis remove failed for key {Key}", key);
        }

        _inMemoryFallback.TryRemove(key, out _);
    }

    public Task RemoveByPrefixAsync(string prefixKey, CancellationToken cancellationToken = default)
    {
        foreach (var key in _inMemoryFallback.Keys.Where(k => k.StartsWith(prefixKey)))
        {
            _inMemoryFallback.TryRemove(key, out _);
        }
        return Task.CompletedTask;
    }
}

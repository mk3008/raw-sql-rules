using System.Collections.Concurrent;

namespace WorkItems.Api.Infrastructure;

internal sealed class SqlFileLoader(IHostEnvironment environment)
{
    private readonly ConcurrentDictionary<string, string> _cache = new(StringComparer.OrdinalIgnoreCase);

    public string Load(params string[] relativePathSegments)
    {
        var cacheKey = string.Join('/', relativePathSegments);

        return _cache.GetOrAdd(cacheKey, _ =>
        {
            var fullPath = Path.Combine([environment.ContentRootPath, .. relativePathSegments]);
            return File.ReadAllText(fullPath);
        });
    }
}

using System.Collections.Concurrent;

namespace WorkItems.Api.Infrastructure;

internal sealed class SqlFileLoader(IHostEnvironment environment)
{
    private readonly ConcurrentDictionary<string, string> _cache = new(StringComparer.OrdinalIgnoreCase);

    public string Load(string relativePath)
    {
        return _cache.GetOrAdd(relativePath, path =>
        {
            var fullPath = Path.Combine(environment.ContentRootPath, path);
            return File.ReadAllText(fullPath);
        });
    }
}

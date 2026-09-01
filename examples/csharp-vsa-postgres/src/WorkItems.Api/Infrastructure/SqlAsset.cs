namespace WorkItems.Api.Infrastructure;

internal static class SqlAsset
{
    public static string Load(params string[] relativePathSegments)
    {
        var path = Path.Combine([AppContext.BaseDirectory, .. relativePathSegments]);
        return File.ReadAllText(path);
    }
}

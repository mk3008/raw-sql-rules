using Npgsql;
using WorkItems.Api.Features.WorkItems;
using WorkItems.Api.Features.WorkItems.GetCompletedWorkItems;
using WorkItems.Api.Features.WorkItems.CompleteWorkItem;
using WorkItems.Api.Features.WorkItems.GetWorkItems;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton(static serviceProvider =>
{
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var connectionString = configuration.GetConnectionString("WorkItems")
        ?? throw new InvalidOperationException("Connection string 'WorkItems' is required.");

    return new NpgsqlDataSourceBuilder(connectionString).Build();
});

var app = builder.Build();

app.MapGet("/", () => "Hello World!");
app.MapGetWorkItems();
app.MapGetCompletedWorkItems();
app.MapCompleteWorkItem();

app.Run();

public partial class Program;

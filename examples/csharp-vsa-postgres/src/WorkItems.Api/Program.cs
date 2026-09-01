using Npgsql;
using WorkItems.Api.Features.WorkItems;
using WorkItems.Api.Features.WorkItems.CompleteWorkItem;
using WorkItems.Api.Features.WorkItems.GetWorkItems;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("WorkItems")
    ?? throw new InvalidOperationException("Connection string 'WorkItems' is required.");

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton(new NpgsqlDataSourceBuilder(connectionString).Build());

var app = builder.Build();

app.MapGet("/", () => "Hello World!");
app.MapGetWorkItems();
app.MapCompleteWorkItem();

app.Run();

public partial class Program;

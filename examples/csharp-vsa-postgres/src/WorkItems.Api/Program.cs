using Npgsql;
using WorkItems.Api.Features.WorkItems.CompleteWorkItem;
using WorkItems.Api.Features.WorkItems.GetCompletedWorkItems;
using WorkItems.Api.Features.WorkItems.GetWorkItems;
using WorkItems.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton(sp =>
{
    var connectionString = builder.Configuration.GetConnectionString("WorkItems")
        ?? throw new InvalidOperationException("Connection string 'WorkItems' is required.");

    return new NpgsqlDataSourceBuilder(connectionString).Build();
});
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<SqlFileLoader>();
builder.Services.AddScoped<GetWorkItemsHandler>();
builder.Services.AddScoped<GetCompletedWorkItemsHandler>();
builder.Services.AddScoped<CompleteWorkItemHandler>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

var workItems = app.MapGroup("/work-items");
workItems.MapGetWorkItems();
workItems.MapGetCompletedWorkItems();
workItems.MapCompleteWorkItem();

app.Run();

public partial class Program;

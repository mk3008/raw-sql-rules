using Npgsql;
using WorkItems.Api.Features.WorkItems.CompleteWorkItem;
using WorkItems.Api.Features.WorkItems.GetCompletedWorkItems;
using WorkItems.Api.Features.WorkItems.GetWorkItems;
using WorkItems.Api.Features.WorkItems.GetOwnerSummary;
using WorkItems.Api.Features.WorkItems.ReassignWorkItemOwner;
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
builder.Services.AddScoped<GetOwnerSummaryHandler>();
builder.Services.AddScoped<CompleteWorkItemHandler>();
builder.Services.AddScoped<ReassignWorkItemOwnerHandler>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

var workItems = app.MapGroup("/work-items");
workItems.MapGetWorkItems();
workItems.MapGetCompletedWorkItems();
workItems.MapGetOwnerSummary();
workItems.MapCompleteWorkItem();
workItems.MapReassignWorkItemOwner();

app.Run();

public partial class Program;

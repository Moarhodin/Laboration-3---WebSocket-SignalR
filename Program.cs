using ChatApp.DataService;
using ChatApp.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<SharedDb>();

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>

{
    options.AddPolicy("reactapp", builder =>
    {
        builder.WithOrigins("http://localhost:3000")
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("reactapp");
//app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapHub<ChatHub>("/chat");

app.Run();
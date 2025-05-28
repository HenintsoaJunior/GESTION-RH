using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Data.SqlClient; // Ajout pour SqlConnection
using rh_backend.Models.CV;

var builder = WebApplication.CreateBuilder(args);

// Ajouter les services pour les contrôleurs et vues
builder.Services.AddControllersWithViews();

// Ajouter ScanCV comme service singleton
builder.Services.AddSingleton<ScanCV>();

var app = builder.Build();

// Configurer le pipeline HTTP
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Test du scan au démarrage (uniquement en développement)
if (app.Environment.IsDevelopment())
{
    try
    {
        // Récupérer la chaîne de connexion depuis la configuration
        string connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
            ?? "Server=localhost\\SQLEXPRESS;Database=master;User Id=CORP\\154;Password=Carasco@20;TrustServerCertificate=True;";

        using (var connection = new SqlConnection(connectionString))
        {
            try
            {
                await connection.OpenAsync(); // Utilisation de OpenAsync pour les opérations asynchrones
                Console.WriteLine("Connexion à la base de données réussie !");
                // Exécuter des requêtes ici si nécessaire
            }
            catch (SqlException ex)
            {
                Console.WriteLine($"Erreur de connexion à la base de données : {ex.Message}");
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Erreur lors de l'initialisation : {ex.Message}");
    }
}

await app.RunAsync(); // Utilisation de RunAsync pour cohérence avec les opérations asynchrones
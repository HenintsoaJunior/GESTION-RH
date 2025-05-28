using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.menu;

namespace MyApp.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Language> Languages { get; set; }
        
    }
}
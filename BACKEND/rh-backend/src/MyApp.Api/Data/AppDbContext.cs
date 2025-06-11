using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.menu;

namespace MyApp.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Language> Languages { get; set; }
        public DbSet<Module> Modules { get; set; }
        public DbSet<Menu> Menus { get; set; }
        public DbSet<MenuHierarchy> MenuHierarchies { get; set; }
        public DbSet<MenuTranslation> MenuTranslations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Menu>()
                .HasIndex(m => m.MenuKey)
                .IsUnique();

            modelBuilder.Entity<MenuTranslation>()
                .HasIndex(mt => new { mt.MenuId, mt.LanguageId })
                .IsUnique();
        }
    }
}
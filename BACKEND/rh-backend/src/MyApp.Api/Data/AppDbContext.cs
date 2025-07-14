using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.contract;
using MyApp.Api.Entities.direction;
using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.menu;
using MyApp.Api.Entities.site;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<EmployeeCategory> EmployeeCategories { get; set; }   
        public DbSet<ContractType> ContractTypes { get; set; }   
        public DbSet<Gender> Genders { get; set; }   
        public DbSet<MaritalStatus> MaritalStatuses { get; set; }   
        public DbSet<Nationality> Nationalities { get; set; }
        public DbSet<Site> Sites { get; set; }
        public DbSet<Unit> Units { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Direction> Directions { get; set; }
        public DbSet<User> Users { get; set; }
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
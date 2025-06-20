using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.action_type;
using MyApp.Api.Entities.contract_types;
using MyApp.Api.Entities.departments;
using MyApp.Api.Entities.menu;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Entities.users;

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

        public DbSet<Department> Departments { get; set; }

        public DbSet<ContractType> ContractTypes { get; set; }

        public DbSet<ActionType> ActionTypes { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<RecruitmentRequest> RecruitmentRequests { get; set; }

        public DbSet<ApprovalFlow> ApprovalFlows { get; set; }

        public DbSet<RecruitmentRequestFile> RecruitmentRequestFiles { get; set; }

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
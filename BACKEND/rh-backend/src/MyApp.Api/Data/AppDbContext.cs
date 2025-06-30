using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities;
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

        public DbSet<RecruitmentApproval> RecruitmentApprovals { get; set; }
        public DbSet<RecruitmentRequestFile> RecruitmentRequestFiles { get; set; }

        public DbSet<ApprovalFlow> ApprovalFlows { get; set; }

        public DbSet<RecruitmentRequest> RecruitmentRequests { get; set; }

        public DbSet<Department> Departments { get; set; }

        public DbSet<ContractType> ContractTypes { get; set; }

        public DbSet<ActionType> ActionTypes { get; set; }

        public DbSet<User> Users { get; set; }
        public DbSet<Language> Languages { get; set; }
        public DbSet<Module> Modules { get; set; }
        public DbSet<Menu> Menus { get; set; }
        public DbSet<MenuHierarchy> MenuHierarchies { get; set; }
        public DbSet<MenuTranslation> MenuTranslations { get; set; }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker.Entries<BaseEntity>();
            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = DateTime.Now;
                }

                // Optionnel : fixer la date de création si elle est vide (utile si tu as des seeds ou ajouts manuels)
                if (entry.State == EntityState.Added && entry.Entity.CreatedAt == default)
                {
                    entry.Entity.CreatedAt = DateTime.Now;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }

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
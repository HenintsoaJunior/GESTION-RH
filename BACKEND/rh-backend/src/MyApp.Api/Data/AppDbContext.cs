using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.application;
using MyApp.Api.Entities.candidates;
using MyApp.Api.Entities.contract;
using MyApp.Api.Entities.direction;
using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.jobs;
using MyApp.Api.Entities.logs;
using MyApp.Api.Entities.menu;
using MyApp.Api.Entities.mission;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Entities.site;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<MissionReport>  MissionReports { get; set; }
        public DbSet<ExpenseReport>  ExpenseReports { get; set; }
        public DbSet<ExpenseReportType>  ExpenseReportTypes { get; set; }
        public DbSet<MissionBudget>  MissionBudgets { get; set; }
        public DbSet<Log>  Logs { get; set; }
        public DbSet<MissionValidation>  MissionValidations { get; set; }
        public DbSet<CvDetail> CvDetails { get; set; }
        public DbSet<ApplicationComment> ApplicationComments { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<Candidate> Candidates { get; set; }
        public DbSet<CategoriesOfEmployee> CategoriesOfEmployees { get; set; }
        public DbSet<MissionAssignation> MissionAssignations { get; set; }
        public DbSet<Lieu> Lieux { get; set; }
        public DbSet<Mission> Missions { get; set; } 
        public DbSet<CompensationScale> CompensationScales { get; set; } 
        public DbSet<Transport> Transports { get; set; } 
        public DbSet<ExpenseType> ExpenseTypes { get; set; } 
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<JobOffer> JobOffers { get; set; } 
        public DbSet<JobDescription> JobDescriptions { get; set; } 
        public DbSet<EmployeeNationality> EmployeeNationalities { get; set; } 
        public DbSet<Employee> Employees { get; set; } 
        public DbSet<WorkingTimeType> WorkingTimeTypes { get; set; }  
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
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<User> Users { get; set; }
        
        public DbSet<Role>  Roles { get; set; }
        
        public DbSet<Habilitation> Habilitations { get; set; }
        
        public DbSet<RoleHabilitation> RoleHabilitations { get; set; }
        public DbSet<Module> Modules { get; set; }
        public DbSet<Menu> Menus { get; set; }
        
        public DbSet<MenuRole> MenuRoles { get; set; }
        public DbSet<MenuHierarchy> MenuHierarchies { get; set; }
        public DbSet<RecruitmentRequestDetail> RecruitmentRequestDetails { get; set; } 
        public DbSet<RecruitmentRequest> RecruitmentRequests { get; set; } 
        public DbSet<RecruitmentRequestReplacementReason> RecruitmentRequestReplacementReasons { get; set; } 
        public DbSet<ReplacementReason> ReplacementReasons { get; set; }  
        public DbSet<RecruitmentReason> RecruitmentReasons { get; set; }  


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Menu>()
                .HasIndex(m => m.MenuKey)
                .IsUnique();
            
            modelBuilder.Entity<RoleHabilitation>()
                .HasOne(rh => rh.Role)
                .WithMany(r => r.RoleHabilitations)
                .HasForeignKey(rh => rh.RoleId)
                .OnDelete(DeleteBehavior.ClientCascade);
            
            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId)
                .OnDelete(DeleteBehavior.ClientCascade);
        }
    }
}
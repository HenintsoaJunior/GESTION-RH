using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.contract;
using MyApp.Api.Entities.direction;
using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.logs;
using MyApp.Api.Entities.menu;
using MyApp.Api.Entities.mission;
using MyApp.Api.Entities.notifications;
using MyApp.Api.Entities.prevision;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Entities.site;
using MyApp.Api.Entities.tmp;
using MyApp.Api.Entities.users;
using MyApp.Api.Entities.zones;
using MyApp.Api.enums;
using MyApp.Api.Extensions;

namespace MyApp.Api.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<ExpenseCompensationScale> ExpenseCompensationScales { get; set; }
        public DbSet<GeoZone> GeoZones { get; set; }
        public DbSet<MissionReportAttachment> MissionReportAttachments { get; set; }
        public DbSet<ExpenseReportAttachment> ExpenseReportAttachments { get; set; }
        public DbSet<Notifications> Notifications { get; set; }
        public DbSet<NotificationRecipients> NotificationRecipients { get; set; }
        public DbSet<MissionComments> MissionComments { get; set; }
        public DbSet<Comments> Comments { get; set; }
        public DbSet<Compensation> Compensations { get; set; }
        public DbSet<MissionReport> MissionReports { get; set; }
        public DbSet<ExpenseReport> ExpenseReports { get; set; }
        public DbSet<ExpenseReportType> ExpenseReportTypes { get; set; }
        public DbSet<MissionBudget> MissionBudgets { get; set; }
        public DbSet<Log> Logs { get; set; }
        public DbSet<MissionValidation> MissionValidations { get; set; }
        public DbSet<CategoriesOfEmployee> CategoriesOfEmployees { get; set; }
        public DbSet<Lieu> Lieux { get; set; }
        public DbSet<Mission> Missions { get; set; } 
        public DbSet<CompensationScale> CompensationScales { get; set; } 
        public DbSet<Transport> Transports { get; set; } 
        public DbSet<ExpenseType> ExpenseTypes { get; set; } 
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
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
        public DbSet<UserAvailability> UserAvailabilities { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Habilitation> Habilitations { get; set; }
        public DbSet<HabilitationGroup> HabilitationGroups { get; set; }
        public DbSet<RoleHabilitation> RoleHabilitations { get; set; }
        public DbSet<UserHabilitation> UserHabilitations { get; set; }
        public DbSet<Module> Modules { get; set; }
        public DbSet<Menu> Menus { get; set; }
        public DbSet<TmpEmployee> TmpEmployees { get; set; }
        public DbSet<MenuRole> MenuRoles { get; set; }
        public DbSet<PrevisionPrice> PrevisionPrices { get; set; }
        public DbSet<MenuHierarchy> MenuHierarchies { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Mission>(entity =>
            {
                entity.Property(e => e.MissionType)
                    .HasConversion(
                        v => v.GetEnumMemberValue(),                             
                        v => v.ParseFromMemberValue<MissionType>())              
                    .HasColumnType("varchar(20)")
                    .HasMaxLength(20)
                    .HasDefaultValue(MissionType.Unknown)
                    .IsRequired();

                entity.Property(e => e.Status)
                    .HasConversion(
                        v => v.GetEnumMemberValue(),
                        v => v.ParseFromMemberValue<MissionStatus>())
                    .HasColumnType("varchar(30)")
                    .HasMaxLength(30)
                    .HasDefaultValue(MissionStatus.PendingApproval)
                    .IsRequired();

                entity.Property(e => e.Type)
                    .HasConversion(
                        v => v.GetEnumMemberValue(),
                        v => v.ParseFromMemberValue<PaymentType>())
                    .HasColumnType("varchar(30)")
                    .HasMaxLength(30)
                    .HasDefaultValue(PaymentType.Indemnite)
                    .IsRequired();
            });
            
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

            modelBuilder.Entity<Employee>(entity =>
            {
                entity.HasKey(e => e.EmployeeId);

                entity.HasIndex(e => e.JobTitle);
                entity.HasIndex(e => e.LastName);
                entity.HasIndex(e => e.FirstName);
                entity.HasIndex(e => e.DirectionId);
                entity.HasIndex(e => e.ContractTypeId);
                entity.HasIndex(e => e.EmployeeCode);
                entity.HasIndex(e => e.SiteId);
                entity.HasIndex(e => e.GenderId);

                entity.HasIndex(e => new { e.LastName, e.FirstName });
            });

            modelBuilder.Entity<PendedRequestToValidate>().HasNoKey();            
        }
        

    // RECRUTEMENT UNIQUEMENT
        public DbSet<RecruitmentRequest> RecruitmentRequests {get; set;}
        public DbSet<ReplacementReason> ReplacementReasons {get; set;}
        public DbSet<RequestStatus> RequestStatuses {get; set;}
        public DbSet<SiteRequest> SitesRequests {get; set;}
        public DbSet<RequestValidation> RequestValidations {get; set;}
        public DbSet<RequestsPerValidator> RequestsPerValidators {get; set;}
        public DbSet<PendedRequestToValidate> PendedRequestToValidates { get; set; } = null!;

        public DbSet<Education> Educations {get; set;}
        public DbSet<Attribution> Attributions {get; set;}
        public DbSet<Experience> Experiences {get; set;}
        public DbSet<Formation> Formations {get; set;}
        public DbSet<JobDescription> JobDescriptions {get; set;}
        public DbSet<JobDescriptionStatus> JobDescriptionStatuses {get; set;}
        public DbSet<JobDescriptionValidation> JobDescriptionValidations {get; set;}
        public DbSet<LevelEducation> LevelEducations {get; set;}
        public DbSet<SoftSkill> SoftSkills {get; set;}
        public DbSet<JobDescriptionSoftSkill> JobDescriptionSoftSkills {get; set;}
        public DbSet<Skill> Skills { get; set; }
    } 
}

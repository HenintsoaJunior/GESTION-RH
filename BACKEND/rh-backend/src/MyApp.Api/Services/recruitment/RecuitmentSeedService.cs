using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment;

public class RecruitmentSeedService
{
    private readonly IJobDescriptionRepository _repo;

    public RecruitmentSeedService(IJobDescriptionRepository repo)
    {
        _repo = repo;
    }

    // public async Task SeedEducationsAsync() {
    //     var defaultEducations = new[] {
    //         "Informatique",
    //         "Maintenance informatique",
    //         "Ressources Humaines",
    //         "Commerce et Marketing",
    //         "Finance et Comptabilité",
    //         "Communication",
    //         "Télécommunication"
    //     };

    //     foreach (var label in defaultEducations) {
    //         bool exists = await _repo.EducationExistsByLabel(label);
    //         if(!exists) {
    //             await _repo.AddEducation(new Education { Name = label });
    //         }
    //     }
    // }

    // public async Task SeedSoftSkillsAsync() {
    //     var defaultSoftSkills = new[] {
    //         "Communicatif", "Sociable", "Autonome", "Organisé",
    //         "Réactif", "Leader", "Créatif", "Persévérant",
    //         "Rigoureux", "Proactif", "Flexible", "Collaboratif"
    //     };

    //     foreach(var label in defaultSoftSkills) {
    //         bool exists = await _repo.SoftSkillExistsByLabel(label);
    //         if(!exists) {
    //             await _repo.AddSoftSkill(new SoftSkill { Name = label });
    //         }
    //     }
    // }

    // public async Task SeedAllAsync() {
    //     await SeedEducationsAsync();
    //     await SeedSoftSkillsAsync();

    //     await _repo.SaveChangesAsync();
    // }
}

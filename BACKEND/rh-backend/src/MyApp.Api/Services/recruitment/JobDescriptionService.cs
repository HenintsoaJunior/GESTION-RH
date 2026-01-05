using MyApp.Api.Entities.recruitment;
using MyApp.Api.Entities.site;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment;

public interface IJobDescriptionService
{
    Task AddJobDescription(JobDescriptionFormDTO data);
    Task<JobDescriptionDTO?> GetJobDescription(string requestId);
    Task<bool> HasJobDescription(string requestId);
    Task<JobDescriptionEditDTO?> GetJobDescriptionEditById(string id);
    Task UpdateJobDescription(string requestId, JobDescriptionFormDTO data);
}


public class JobDescriptionService(IJobDescriptionRepository rep,
 IRequestRepository req, ILogger<JobDescriptionService> log)
: IJobDescriptionService {
    private readonly IJobDescriptionRepository _jobDescRepo = rep;
    private readonly IRequestRepository _reqRepo = req;
    private readonly ILogger<JobDescriptionService> _log = log;


    public async Task AddJobDescription(JobDescriptionFormDTO data) {
        try {
            _log.LogInformation("Création de fiche de poste en cours");

            RecruitmentRequest request = await _reqRepo.GetRecruitmentRequestById(data.RequestId);
            if(!request.LastStatus.Equals("Validée")) 
                throw new ArgumentException("Impossible de la créer avec demande invalide");

            if(this.GetJobDescription(request.Id)!=null)
                throw new ArgumentException("Une seule fiche par demande autorisée");

            var jobDescription = new JobDescription
            {
                Mission = data.Mission,
                Request = request
            };

            await _jobDescRepo.AddJobDescription(jobDescription);

        // Attributions
            foreach (var label in data.Attributions) {
                await _jobDescRepo.AddJobAttribution(new Attribution
                {
                    JobDescription = jobDescription,
                    Label = label
                });
            }

            // Formations
            foreach (var dto in data.Formations) {
                var education = new Education { Id = dto.EducationId };
                var level = new LevelEducation { Id = dto.LevelEducationId };

                _jobDescRepo.Attach(education);
                _jobDescRepo.Attach(level);

                await _jobDescRepo.AddFormation(new Formation
                {
                    JobDescription = jobDescription,
                    Education = education,
                    LevelEducation = level
                });
            }

            // Expériences
            foreach (var dto in data.Experiences) {
                await _jobDescRepo.AddExperience(new Experience
                {
                    JobDescription = jobDescription,
                    ExperiencePost = dto.Post,
                    ExperienceYears = dto.Years
                });
            }

            // Soft skills
            foreach (var dto in data.SoftSkills) {
                var softSkill = new SoftSkill { Id = dto.Id };
                _jobDescRepo.Attach(softSkill);

                await _jobDescRepo.AddJobDescriptionSoftSkill(
                    new JobDescriptionSoftSkill {
                        JobDescription = jobDescription,
                        SoftSkill = softSkill
                    }
                );
            }

            // Skills
            foreach (var dto in data.Skills) {
                await _jobDescRepo.AddSkill(new Skill
                {
                    JobDescription = jobDescription,
                    Label = dto.Label
                });
            }

            // COMMIT
            await _jobDescRepo.SaveChangesAsync();
        }
        catch (Exception ex) {
            _log.LogError(ex, "Erreur de création de fiche de poste");
            throw;
        }
    }
    

    public async Task<JobDescriptionDTO?> GetJobDescription(string requestId) {
        try {
            _log.LogInformation("Recherche de fiche de poste en cours");
            JobDescriptionDTO result = new();

            RecruitmentRequest request = await _reqRepo.GetRecruitmentRequestById(requestId);
            List<Site> sites = await _reqRepo.GetSitesAsync(request);
            JobDescription? jobDesc = await _jobDescRepo.GetJobDescriptionByRequest(request);

            if(jobDesc==null) return null;

        // Infos générales
            result.RequestId = requestId;
            result.Post = request.Post;
            result.LastTitular = request.LastTitular?.Name;
            result.Id = jobDesc.Id;
            result.Mission = jobDesc.Mission;

        // Attributions
            result.Attributions = jobDesc.Attributions
                .Select(a => a.Label).ToArray();

        // Formations et Expériences
            result.Formations = jobDesc.Formations
                .Select(f => 
                    $"{f.Education.Name} de niveau {f.LevelEducation.Name}").ToArray();

            result.Experiences = jobDesc.Experiences
                .Select(e => 
                    $"Minimum {e.ExperienceYears} an(s) au poste de {e.ExperiencePost.ToLower()}").ToArray();

        // SoftSkills
            result.SoftSkills = jobDesc.SoftSkills
                .Select(s => s.SoftSkill.Name)
                .ToArray();

        // Skills
            result.Skills = jobDesc.Skills.Select(s => s.Label).ToArray(); 

            return result;   
        }
        catch (Exception ex) {
            _log.LogError(ex, "Erreur de recherche de fiche de poste");
            throw;
        }
    }


    public async Task<bool> HasJobDescription(string requestId) {
        _log.LogInformation("Vérification de l'éxistence en cours");
        return await this.GetJobDescription(requestId)!=null;
    }


    public async Task UpdateJobDescription(string requestId, JobDescriptionFormDTO data) {
        try {
            _log.LogInformation("Mise à jour de fiche de poste en cours");

            RecruitmentRequest request = await _reqRepo.GetRecruitmentRequestById(requestId);
            JobDescription? lastJobDesc = await _jobDescRepo.GetJobDescriptionByRequest(request);

            if(lastJobDesc == null)
                throw new ArgumentException("Aucune fiche de poste à mettre à jour");

            lastJobDesc.Mission = data.Mission;
            lastJobDesc.RequestId = requestId; // safe

            // =========================
            // Nettoyage des collections
            // =========================
            _jobDescRepo.RemoveAttributions(lastJobDesc.Attributions);
            _jobDescRepo.RemoveFormations(lastJobDesc.Formations);
            _jobDescRepo.RemoveExperiences(lastJobDesc.Experiences);
            _jobDescRepo.RemoveSoftSkills(lastJobDesc.SoftSkills);
            _jobDescRepo.RemoveSkills(lastJobDesc.Skills);

            // =========================
            // Réinsertion
            // =========================

            // Attributions
            foreach (var label in data.Attributions) {
                await _jobDescRepo.AddJobAttribution(new Attribution
                {
                    JobDescription = lastJobDesc,
                    Label = label
                });
            }

            // Formations
            foreach (var dto in data.Formations) {
                var education = new Education { Id = dto.EducationId };
                var level = new LevelEducation { Id = dto.LevelEducationId };

                _jobDescRepo.Attach(education);
                _jobDescRepo.Attach(level);

                await _jobDescRepo.AddFormation(new Formation
                {
                    JobDescription = lastJobDesc,
                    Education = education,
                    LevelEducation = level
                });
            }

            // Expériences
            foreach (var dto in data.Experiences) {
                await _jobDescRepo.AddExperience(new Experience
                {
                    JobDescription = lastJobDesc,
                    ExperiencePost = dto.Post,
                    ExperienceYears = dto.Years
                });
            }

            // Soft skills
            foreach (var dto in data.SoftSkills) {
                var softSkill = new SoftSkill { Id = dto.Id };
                _jobDescRepo.Attach(softSkill);

                await _jobDescRepo.AddJobDescriptionSoftSkill(new JobDescriptionSoftSkill
                {
                    JobDescription = lastJobDesc,
                    SoftSkill = softSkill
                });
            }

            // Skills
            foreach (var dto in data.Skills) {
                await _jobDescRepo.AddSkill(new Skill
                {
                    JobDescription = lastJobDesc,
                    Label = dto.Label
                });
            }

            // Commit
            await _jobDescRepo.SaveChangesAsync();
        }
        catch (Exception ex) {
            _log.LogError(ex, "Erreur de mise à jour de fiche de poste");
            throw;
        }
    }


    public async Task<JobDescriptionEditDTO?> GetJobDescriptionEditById(string id) {
        try {
            _log.LogInformation("Recherche de fiche de poste par ID en cours");

            JobDescription jobDesc = await _jobDescRepo.GetJobDescriptionById(id);

            if(jobDesc == null) return null;

            var result = new JobDescriptionEditDTO
            {
                Id = jobDesc.Id,
                RequestId = jobDesc.RequestId,
                Mission = jobDesc.Mission,
                Attributions = jobDesc.Attributions.Select(a => a.Label).ToArray(),
                Formations = jobDesc.Formations.Select(f => new FormationDTO
                {
                    EducationId = f.Education.Id,
                    LevelEducationId = f.LevelEducation.Id
                }).ToArray(),
                Experiences = jobDesc.Experiences.Select(e => new ExperienceDTO
                {
                    Post = e.ExperiencePost,
                    Years = e.ExperienceYears
                }).ToArray(),
                SoftSkills = jobDesc.SoftSkills.Select(s => new SoftSkillDTO
                {
                    Id = s.SoftSkill.Id
                }).ToArray(),
                Skills = jobDesc.Skills.Select(s => new SkillDTO
                {
                    Label = s.Label
                }).ToArray()
            };

            return result;
        }
        catch (Exception ex) {
            _log.LogError(ex, "Erreur de recherche de fiche de poste par ID");
            throw;
        }
    }
}

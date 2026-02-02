using MyApp.Api.Entities.recruitment;
using MyApp.Api.Entities.site;
using MyApp.Api.Models.dto.notifications;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.recruitment;
using MyApp.Api.Services.logs;
using MyApp.Api.Services.notifications;

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
 IRecruitmentRequestRepository req, 
 ILogger<JobDescriptionService> log, ILogService logS,
 IJobDescriptionValidationRepository repo2, INotificationsService notif)
: IJobDescriptionService {
    private readonly IJobDescriptionRepository _jobDescRepo = rep;
    private readonly IRecruitmentRequestRepository _reqRepo = req;
    private readonly IJobDescriptionValidationRepository _validationRepo = repo2;
    private readonly ILogger<JobDescriptionService> _log = log;
    private readonly INotificationsService _notifService = notif;
    private readonly ILogService _logService = logS;


    public async Task AddJobDescription(JobDescriptionFormDTO data) {
        try {
            _log.LogInformation("Création d'un TDR en cours");

            RecruitmentRequest request = await _reqRepo.GetRecruitmentRequestById(data.RequestId);
            if(!request.LastStatus.ToLower().Equals("validée")) 
                throw new ArgumentException("Impossible d'en créer avec une demande non validée");

            var jobWithRequest = await this.GetJobDescription(request.Id);
            if(jobWithRequest!=null) {
                _log.LogInformation(jobWithRequest.Id);
                throw new ArgumentException("Un seul TDR par demande autorisé");
            }

        // Statut "En attente" par défaut
            var defaultStatus = await _jobDescRepo.GetJobDescriptionStatusById("STF_001");
                
            var jobDescription = new JobDescription {
                Mission = data.Mission,
                RequestId = request.Id,
                LastStatus = defaultStatus.Name
            };

            await _jobDescRepo.AddJobDescription(jobDescription);

        // Attributions
            foreach (var label in data.Attributions) {
                await _jobDescRepo.AddJobAttribution(new Attribution
                {
                    JobDescriptionId = jobDescription.Id,
                    Label = label
                });
            }

        // Formations
            foreach (var dto in data.Formations) {
                await _jobDescRepo.AddFormation(new Formation 
                {
                    JobDescriptionId = jobDescription.Id,
                    EducationId = dto.EducationId,
                    LevelEducationId = dto.LevelEducationId
                });
            }

        // Expériences
            foreach (var dto in data.Experiences) {
                await _jobDescRepo.AddExperience(new Experience
                {
                    JobDescriptionId = jobDescription.Id,
                    ExperiencePost = dto.Post,
                    ExperienceYears = dto.Years
                });
            }

        // Soft skills
            foreach (var dto in data.SoftSkills) {
                await _jobDescRepo.AddJobDescriptionSoftSkill(new JobDescriptionSoftSkill 
                {
                    JobDescriptionId = jobDescription.Id,
                    SoftSkillId = dto.Id
                });
            }

        // Skills
            foreach (var dto in data.Skills) {
                await _jobDescRepo.AddSkill(new Skill
                {
                    JobDescriptionId = jobDescription.Id,
                    Label = dto.Label
                });
            }

        // Validation du TDR
            var validation = new JobDescriptionValidation {
                ValidatorId = data.CreatorId,
                StatusId = "STF_001",
                JobDescriptionId = jobDescription.Id
            };
            await _jobDescRepo.AddValidation(validation);

        // COMMIT
            await _jobDescRepo.SaveChangesAsync();

        // LOG
            await _logService.LogAsync("INSERTION TDR", "termes_reference",
             request.Creator.UserId);
        }
        catch (Exception ex) {
            _log.LogError(ex, "Erreur de création d'un TDR");
            throw;
        }
    }
    

    public async Task<JobDescriptionDTO?> GetJobDescription(string requestId) {
        try {
            _log.LogInformation("Recherche de TDR en cours");
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
            result.CreatedAt = jobDesc.CreatedAt;

        // Attributions
            result.Attributions = jobDesc.Attributions
                .Select(a => a.Label).ToArray();

        // Formations et Expériences
            result.Formations = jobDesc.Formations
                .Select(f => 
                    $"{f.Education.Name} de niveau {f.LevelEducation.Name}").ToArray();

            result.Experiences = jobDesc.Experiences
                .Select(e => 
                    $"Minimum {e.ExperienceYears} an(s) au poste de \"{e.ExperiencePost}\" ou poste équivalent").ToArray();

        // SoftSkills
            result.SoftSkills = jobDesc.SoftSkills
                .Select(s => s.SoftSkill.Name)
                .ToArray();

        // Skills
            result.Skills = jobDesc.Skills.Select(s => s.Label).ToArray(); 

            return result;   
        }
        catch (Exception ex) {
            _log.LogError(ex, "Erreur de recherche de TDR");
            throw;
        }
    }


    public async Task<bool> HasJobDescription(string requestId) {
        _log.LogInformation("Vérification de l'éxistence en cours");
        return await this.GetJobDescription(requestId)!=null;
    }


    public async Task UpdateJobDescription(string requestId, JobDescriptionFormDTO data) {
        try {
            _log.LogInformation("Mise à jour du TDR en cours");

            RecruitmentRequest request = await _reqRepo.GetRecruitmentRequestById(requestId);
            JobDescription? lastJobDesc = await _jobDescRepo.GetJobDescriptionByRequest(request);

            if(lastJobDesc == null) throw new ArgumentException("Aucun TDR à mettre à jour");

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
                    JobDescriptionId = lastJobDesc.Id,
                    Label = label
                });
            }

            // Formations
            foreach (var dto in data.Formations) {
                await _jobDescRepo.AddFormation(new Formation
                {
                    JobDescriptionId = lastJobDesc.Id,
                    EducationId = dto.EducationId,
                    LevelEducationId = dto.LevelEducationId
                });
            }

            // Expériences
            foreach (var dto in data.Experiences) {
                await _jobDescRepo.AddExperience(new Experience
                {
                    JobDescriptionId = lastJobDesc.Id,
                    ExperiencePost = dto.Post,
                    ExperienceYears = dto.Years
                });
            }

            // Soft skills
            foreach (var dto in data.SoftSkills) {
                await _jobDescRepo.AddJobDescriptionSoftSkill(new JobDescriptionSoftSkill
                {
                    JobDescriptionId = lastJobDesc.Id,
                    SoftSkillId = dto.Id
                });
            }

            // Skills
            foreach (var dto in data.Skills) {
                await _jobDescRepo.AddSkill(new Skill
                {
                    JobDescriptionId = lastJobDesc.Id,
                    Label = dto.Label
                });
            }

            // Commit
            await _jobDescRepo.SaveChangesAsync();

            // LOG
            await _logService.LogAsync("MODIFICATION TDR", "termes_reference",
             request.Creator.UserId);
        }
        catch (Exception ex) {
            _log.LogError(ex, "Erreur de mise à jour de TDR");
            throw;
        }
    }
    

    public async Task<JobDescriptionEditDTO?> GetJobDescriptionEditById(string id) {
        try {
            _log.LogInformation("Recherche de TDR par ID en cours");

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
            _log.LogError(ex, "Erreur de recherche de TDR par ID");
            throw;
        }
    }


    public async Task ValidateJobDescription(JobDescriptionValidationDTO data) {
        try {
            _log.LogInformation("En cours de faire la validation ...");
            var jobDesc = await _validationRepo.ValidateJobDescription(data);

        // Tous les validateurs en même temps
            List<UserDto> validators = await _validationRepo.GetAllValidators(data.JobDescId);
            List<string> validatorsIds = validators.Select(u=>u.UserId).ToList();

        // Envoi de notification au créateur
            if(validators!=null) {
                var notification = new NotificationFormDTO
                {
                    Title = $"Votre TDR a été validée",
                    Message = $"Le TDR au poste de \"{jobDesc.Request.Post}\" est validé.",
                    Type = "recruitment",
                    RelatedTable = "TDRs",
                    RelatedMenu = "collaborateur",
                    RelatedId = jobDesc.Id,
                    Priority = 2,
                    UserIds = validatorsIds,
                    CreatedAt = DateTime.UtcNow
                };

            // Envoi de notification
                await _notifService.CreateAsync(notification, null);
            }
        }
        catch(Exception ex) {
            _log.LogError(ex, "Erreur lors de la validation");
            throw;
        }
    }
}

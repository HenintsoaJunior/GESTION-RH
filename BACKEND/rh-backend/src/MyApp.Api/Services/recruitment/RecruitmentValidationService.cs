using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Repositories.recruitment;
using MyApp.Api.Utils.generator;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using static MyApp.Api.Models.dto.recruitment.RecruitmentValidationDTO;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentValidationService
    {
        Task<(IEnumerable<RecruitmentValidation>, int)> GetRequestAsync(string userId, int page, int pageSize);
        Task<RecruitmentValidation?> VerifyRecruitmentValidationByRequestIdAsync(string recruitmentRequestId);
        Task<(IEnumerable<RecruitmentValidation>, int)> SearchAsync(RecruitmentValidationSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<RecruitmentValidation>> GetAllAsync();
        Task<IEnumerable<RecruitmentValidation?>?> GetByRequestIdAsync(string recruitmentRequestId);
        Task<RecruitmentValidation?> GetByIdAsync(string id);
        Task<string> CreateAsync(RecruitmentValidationDTOForm recruitmentValidation, string userId);
        Task<bool> UpdateAsync(string id, RecruitmentValidationDTOForm recruitmentValidation, string userId);
        Task<bool> DeleteAsync(string id, string userId);
        Task<bool> UpdateStatusAsync(string id, string status, string userId);
    }

    public class RecruitmentValidationService : IRecruitmentValidationService
    {
        private readonly IRecruitmentValidationRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;

        public RecruitmentValidationService(
            IRecruitmentValidationRepository repository,
            ISequenceGenerator sequenceGenerator)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
        }

        public async Task<(IEnumerable<RecruitmentValidation>, int)> GetRequestAsync(string userId, int page, int pageSize)
        {
            var (results, totalCount) = await _repository.GetRequestAsync(userId, page, pageSize);
            return (results, totalCount);
        }

        public async Task<RecruitmentValidation?> VerifyRecruitmentValidationByRequestIdAsync(string recruitmentRequestId)
        {
            var filters = new RecruitmentValidationSearchFiltersDTO
            {
                RecruitmentRequestId = recruitmentRequestId
            };
            var (result, total) = await _repository.SearchAsync(filters, 1, 1);
            return result.FirstOrDefault();
        }

        public async Task<(IEnumerable<RecruitmentValidation>, int)> SearchAsync(RecruitmentValidationSearchFiltersDTO filters, int page, int pageSize)
        {
            return await _repository.SearchAsync(filters, page, pageSize);
        }

        public async Task<IEnumerable<RecruitmentValidation>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<IEnumerable<RecruitmentValidation?>?> GetByRequestIdAsync(string recruitmentRequestId)
        {
            return await _repository.GetByRequestIdAsync(recruitmentRequestId);
        }

        public async Task<RecruitmentValidation?> GetByIdAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return null;
            }
            return await _repository.GetByIdAsync(id);
        }

        public async Task<string> CreateAsync(RecruitmentValidationDTOForm? recruitmentValidationDto, string userId)
        {
            if (recruitmentValidationDto == null)
            {
                throw new ArgumentNullException(nameof(recruitmentValidationDto), "Les données de la validation de recrutement ne peuvent pas être nulles");
            }
            var recruitmentValidationId = _sequenceGenerator.GenerateSequence("seq_recruitment_validation_id", "RVAL", 6, "-");
            var recruitmentValidation = new RecruitmentValidation(recruitmentValidationDto)
            {
                RecruitmentValidationId = recruitmentValidationId
            };
            await _repository.AddAsync(recruitmentValidation);
            await _repository.SaveChangesAsync();
            return recruitmentValidationId;
        }

        public async Task<bool> UpdateAsync(string id, RecruitmentValidationDTOForm? recruitmentValidationDto, string userId)
        {
            if (recruitmentValidationDto == null)
            {
                throw new ArgumentNullException(nameof(recruitmentValidationDto), "Les données de la validation de recrutement ne peuvent pas être nulles");
            }
            var existingRecruitmentValidation = await _repository.GetByIdAsync(id);
            if (existingRecruitmentValidation == null)
            {
                throw new InvalidOperationException($"La validation de recrutement avec l'ID {id} n'existe pas");
            }
            var newRecruitmentValidation = new RecruitmentValidation(recruitmentValidationDto)
            {
                RecruitmentValidationId = id
            };
            await _repository.UpdateAsync(newRecruitmentValidation);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(string id, string userId)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("L'ID de la validation de recrutement ne peut pas être null ou vide", nameof(id));
            }
            var existingRecruitmentValidation = await _repository.GetByIdAsync(id);
            if (existingRecruitmentValidation == null)
            {
                return false;
            }
            await _repository.DeleteAsync(existingRecruitmentValidation);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateStatusAsync(string id, string status, string userId)
        {
            var existingRecruitmentValidation = await _repository.GetByIdAsync(id);
            if (existingRecruitmentValidation == null)
            {
                return false;
            }
            var result = await _repository.UpdateStatusAsync(id, status);
            return result;
        }
    }
}
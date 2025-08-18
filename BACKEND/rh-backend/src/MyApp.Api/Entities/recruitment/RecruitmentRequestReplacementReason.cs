using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Models.form.recruitment;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_request_replacement_reasons")]
    [PrimaryKey(nameof(RecruitmentRequestId), nameof(ReplacementReasonId))]
    public class RecruitmentRequestReplacementReason
    {
        [Column("recruitment_request_id")]
        [MaxLength(50)]
        public string RecruitmentRequestId { get; set; } = null!;

        [Column("replacement_reason_id")]
        [MaxLength(50)]
        public string ReplacementReasonId { get; set; } = null!;

        [Column("description")]
        [MaxLength(250)]
        public string? Description { get; set; }

        // Navigation properties
        [ForeignKey("RecruitmentRequestId")]
        public virtual RecruitmentRequest RecruitmentRequest { get; set; } = null!;

        [ForeignKey("ReplacementReasonId")]
        public virtual ReplacementReason ReplacementReason { get; set; } = null!;

        // Méthode statique pour créer une collection depuis le formulaire
        // public static IEnumerable<RecruitmentRequestReplacementReason> FromForm(RecruitmentRequestDTOForm requestForm)
        // {
        //     return requestForm.ReplacementReasons?.Select(rr => new RecruitmentRequestReplacementReason
        //     {
        //         ReplacementReasonId = rr.ReplacementReasonId,
        //         Description = rr.Description
        //     }) ?? Enumerable.Empty<RecruitmentRequestReplacementReason>();
        // }

        public static IEnumerable<RecruitmentRequestReplacementReason> FromForm(RecruitmentRequestDTOForm requestForm)
        {
            return requestForm.ReplacementReasons != null
                ? requestForm.ReplacementReasons.Select(r => new RecruitmentRequestReplacementReason
                {
                    ReplacementReasonId = r.ReplacementReasonId,
                    Description = r.Description
                }).ToList()
                : Enumerable.Empty<RecruitmentRequestReplacementReason>();
        }

    }
}
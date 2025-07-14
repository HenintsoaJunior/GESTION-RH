using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities
{
    public abstract class CodeLabel : BaseEntity
    {
        [Column("code")]
        [MaxLength(50)]
        public string Code { get; set; } = null!;

        [Required]
        [Column("label")]
        [MaxLength(50)]
        public string Label { get; set; } = null!;
    }
}

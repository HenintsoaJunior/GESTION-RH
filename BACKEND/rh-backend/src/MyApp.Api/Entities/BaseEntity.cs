using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities
{
    public abstract class BaseEntity
    {
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}

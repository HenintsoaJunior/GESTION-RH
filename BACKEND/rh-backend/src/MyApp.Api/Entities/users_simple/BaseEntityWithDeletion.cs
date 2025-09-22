using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.users_simple
{
    public abstract class BaseEntityWithDeletion
    {
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; } = DateTime.Now;

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }
    }
}
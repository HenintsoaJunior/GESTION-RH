using MyApp.Api.Entities;

public static class EntityAuditHelper
{
    public static void SetUpdatedTimestamp<TEntity>(TEntity entity) where TEntity : BaseEntity
    {
        entity.UpdatedAt = DateTime.Now;
    }

    public static void SetCreatedTimestamp<TEntity>(TEntity entity) where TEntity : BaseEntity
    {
        if (entity.CreatedAt == default)
            entity.CreatedAt = DateTime.Now;
    }
}